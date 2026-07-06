"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { useCreateNote, useDeleteNote } from "@/hooks/useNotes";

/** ID input pencarian — dipakai shortcut ⌘F untuk fokus. */
export const SEARCH_INPUT_ID = "notes-search-input";

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    el.isContentEditable ||
    el.closest(".ProseMirror") !== null
  );
}

/**
 * Shortcut global ala Apple Notes:
 * - ⌘/Ctrl + N      → catatan baru
 * - ⌘/Ctrl + F      → fokus pencarian
 * - ⌘/Ctrl + ⌫      → hapus catatan aktif (soft delete)
 * - Esc             → kosongkan pencarian / tutup catatan aktif
 */
export function useKeyboardShortcuts() {
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNote();
        return;
      }

      if (mod && e.key.toLowerCase() === "f") {
        e.preventDefault();
        document.getElementById(SEARCH_INPUT_ID)?.focus();
        return;
      }

      if (mod && (e.key === "Backspace" || e.key === "Delete")) {
        const { activeNoteId, activeCollection, setActiveNoteId } = useUIStore.getState();
        if (activeNoteId && activeCollection !== "recently-deleted") {
          e.preventDefault();
          deleteNote(activeNoteId);
          setActiveNoteId(null);
        }
        return;
      }

      if (e.key === "Escape" && !isEditableTarget(e.target)) {
        const { searchQuery, setSearchQuery, setActiveNoteId } = useUIStore.getState();
        if (searchQuery) setSearchQuery("");
        else setActiveNoteId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createNote, deleteNote]);
}
