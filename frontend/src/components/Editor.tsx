"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExt from "@tiptap/extension-image";
import { useUIStore, useSaveStore } from "@/lib/store";
import { FormatToolbar } from "@/components/FormatToolbar";
import { EmptyState } from "@/components/EmptyState";
import { LockScreen, LockDialog } from "@/components/LockGate";
import { useNote, useUpdateNote, useTogglePin, useDeleteNote, useUnlockNote } from "@/hooks/useNotes";
import { longDate, wordCount } from "@/lib/format";
import { useEffect, useRef, useState } from "react";
import { Lock, Pin, Trash2 } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

export function Editor() {
  const activeNoteId = useUIStore((s) => s.activeNoteId);
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId);
  const note = useNote(activeNoteId);
  const updateNote = useUpdateNote();
  const togglePin = useTogglePin();
  const deleteNote = useDeleteNote();
  const unlockNote = useUnlockNote();
  const setSaveStatus = useSaveStore((s) => s.setStatus);

  const [lockOpen, setLockOpen] = useState(false);
  const loadedId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      ImageExt.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Mulai menulis…" }),
    ],
    editorProps: { attributes: { class: "focus:outline-none min-h-[60vh]" } },
    content: "",
    onUpdate: ({ editor }) => {
      if (!activeNoteId) return;
      const json = editor.getJSON();
      setSaveStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(activeNoteId, { contentJson: json as Record<string, unknown> }).then(() =>
          setSaveStatus("saved"),
        );
      }, 400);
    },
  });

  // Muat konten saat berpindah catatan (bukan tiap keystroke).
  useEffect(() => {
    if (!editor || !note || note.locked) return;
    if (loadedId.current === note.id) return;
    loadedId.current = note.id;
    editor.commands.setContent((note.contentJson as JSONContent) ?? "");
  }, [editor, note]);

  useEffect(() => {
    if (!activeNoteId) loadedId.current = null;
  }, [activeNoteId]);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  }

  if (!activeNoteId || !note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState type="editor" />
      </div>
    );
  }

  // Catatan terkunci → minta passcode.
  if (note.locked) {
    return (
      <LockScreen
        onUnlock={async (passcode) => {
          await unlockNote(note.id, passcode);
          loadedId.current = null;
        }}
      />
    );
  }

  const words = wordCount(note.contentText);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
        aria-hidden="true"
      />

      {/* Toolbar + actions */}
      <div className="flex items-stretch h-[56px] flex-shrink-0 border-b border-separator bg-bg-app sticky top-0 z-10">
        <div className="flex-1 min-w-0 flex items-center">
          <FormatToolbar editor={editor} onInsertImage={() => fileInput.current?.click()} />
        </div>
        <div className="flex items-center gap-1 px-3">
          <button
            onClick={() => togglePin(note.id)}
            className={`p-[7px] rounded-lg transition-colors cursor-pointer ${
              note.pinned
                ? "text-accent"
                : "text-text-secondary hover:bg-hover hover:text-text-primary"
            }`}
            aria-label={note.pinned ? "Lepas Sematan" : "Sematkan"}
            title={note.pinned ? "Lepas Sematan" : "Sematkan"}
          >
            <Pin className={`w-5 h-5 ${note.pinned ? "fill-accent rotate-45" : ""}`} />
          </button>
          <button
            onClick={() => setLockOpen(true)}
            className="p-[7px] rounded-lg text-text-secondary hover:bg-hover hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Kunci catatan"
            title="Kunci catatan"
          >
            <Lock className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              deleteNote(note.id);
              setActiveNoteId(null);
            }}
            className="p-[7px] rounded-lg text-text-secondary hover:bg-hover hover:text-danger transition-colors cursor-pointer"
            aria-label="Hapus catatan"
            title="Hapus"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Konten */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-8 sm:px-12 lg:px-16 py-8">
          <p className="text-text-secondary text-[13px] mb-6 text-center tabular-nums">
            {longDate(note.updatedAt)}
          </p>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center px-8 h-[32px] flex-shrink-0 border-t border-separator">
        <span className="text-text-secondary text-[12px] tabular-nums">
          {words} kata
        </span>
      </div>

      <LockDialog open={lockOpen} noteId={note.id} onOpenChange={setLockOpen} />
    </div>
  );
}
