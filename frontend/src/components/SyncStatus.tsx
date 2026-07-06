"use client";

import { useSaveStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Check, RefreshCw, WifiOff } from "lucide-react";

/** Indikator status simpan lokal + offline. Local-only, tanpa server. */
export function SyncStatus() {
  const status = useSaveStore((s) => s.status);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!online) {
    return (
      <div
        className="flex items-center gap-1 text-xs font-medium text-text-secondary"
        title="Offline — semua tersimpan lokal"
        aria-live="polite"
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-text-secondary" aria-live="polite">
      {status === "saving" ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Menyimpan…</span>
        </>
      ) : (
        <>
          <Check className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tersimpan</span>
        </>
      )}
    </div>
  );
}
