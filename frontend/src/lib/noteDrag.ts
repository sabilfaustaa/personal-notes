export const NOTE_DRAG_MIME = "application/x-apple-notes-note-id";

export function hasDraggedNote(types: readonly string[]): boolean {
  return Array.from(types).includes(NOTE_DRAG_MIME);
}
