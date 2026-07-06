"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Lock, ShieldCheck } from "lucide-react";
import { useLockNote } from "@/hooks/useNotes";

/** Layar buka-kunci di editor untuk catatan terkunci. */
export function LockScreen({ onUnlock }: { onUnlock: (passcode: string) => Promise<void> }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode || busy) return;
    setBusy(true);
    setError(false);
    try {
      await onUnlock(passcode);
    } catch {
      setError(true);
      setBusy(false);
      setPasscode("");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <form onSubmit={submit} className="flex flex-col items-center text-center max-w-xs w-full animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-text-primary font-semibold text-lg mb-1">Catatan terkunci</h3>
        <p className="text-text-secondary text-sm mb-5">Masukkan passcode untuk membuka.</p>
        <input
          type="password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          aria-label="Passcode"
          className={`w-full px-4 py-2.5 rounded-input bg-bg-elevated border text-text-primary text-sm text-center
                     outline-none transition-colors ${error ? "border-danger" : "border-separator focus:border-accent"}`}
        />
        {error && <p className="text-danger text-xs mt-2">Passcode salah. Coba lagi.</p>}
        <button
          type="submit"
          disabled={!passcode || busy}
          className="mt-4 w-full py-2.5 rounded-input bg-accent text-white text-sm font-semibold
                     hover:bg-accent-strong transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {busy ? "Membuka…" : "Buka kunci"}
        </button>
      </form>
    </div>
  );
}

/** Dialog set passcode untuk mengunci catatan. */
export function LockDialog({
  open,
  noteId,
  onOpenChange,
}: {
  open: boolean;
  noteId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const lockNote = useLockNote();
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPasscode("");
    setConfirm("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (passcode.length < 4) return setError("Passcode minimal 4 karakter.");
    if (passcode !== confirm) return setError("Konfirmasi passcode tidak cocok.");
    await lockNote(noteId, passcode);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(92vw,360px)]
                                   bg-bg-elevated rounded-card shadow-popover border border-separator p-6 animate-pop-in">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <Dialog.Title className="text-text-primary font-semibold text-base">Kunci catatan</Dialog.Title>
          </div>
          <Dialog.Description className="text-text-secondary text-sm mb-4">
            Konten dienkripsi di perangkat. Passcode tidak disimpan — jika lupa, catatan tak bisa dipulihkan.
          </Dialog.Description>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              type="password"
              autoFocus
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode baru"
              aria-label="Passcode baru"
              className="w-full px-3 py-2 rounded-input bg-bg-app border border-separator text-text-primary text-sm
                         outline-none focus:border-accent transition-colors"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi passcode"
              aria-label="Ulangi passcode"
              className="w-full px-3 py-2 rounded-input bg-bg-app border border-separator text-text-primary text-sm
                         outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-danger text-xs">{error}</p>}
            <div className="flex justify-end gap-2 mt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-2 rounded-input text-sm text-text-secondary hover:bg-selection transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-3 py-2 rounded-input text-sm font-semibold bg-accent text-white hover:bg-accent-strong transition-colors cursor-pointer"
              >
                Kunci
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
