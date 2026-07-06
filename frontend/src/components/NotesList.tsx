"use client";

import { useUIStore } from "@/lib/store";
import { SearchBar } from "@/components/SearchBar";
import { NoteRow } from "@/components/NoteRow";
import { EmptyState } from "@/components/EmptyState";
import { SquarePen } from "lucide-react";
import {
  useNotes,
  useFolders,
  useCreateNote,
  useTogglePin,
  useDeleteNote,
  useRestoreNote,
  usePurgeNote,
} from "@/hooks/useNotes";
import { relativeDate, snippetFrom } from "@/lib/format";

export function NotesList() {
  const activeNoteId = useUIStore((s) => s.activeNoteId);
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const activeCollection = useUIStore((s) => s.activeCollection);
  const activeFolderId = useUIStore((s) => s.activeFolderId);
  const activeTag = useUIStore((s) => s.activeTag);

  const notes = useNotes();
  const folders = useFolders() ?? [];
  const createNote = useCreateNote();
  const togglePin = useTogglePin();
  const deleteNote = useDeleteNote();
  const restoreNote = useRestoreNote();
  const purgeNote = usePurgeNote();

  const isDeletedView = activeCollection === "recently-deleted";

  const pinned = (notes ?? []).filter((n) => n.pinned && !isDeletedView);
  const rest = (notes ?? []).filter((n) => !n.pinned || isDeletedView);

  const heading = isDeletedView
    ? "Baru Dihapus"
    : activeTag
      ? `#${activeTag}`
      : activeFolderId
        ? folders.find((f) => f.id === activeFolderId)?.name ?? "Catatan"
        : "Semua Catatan";

  const total = notes?.length ?? 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header: title + new note */}
      <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3">
        <h3 className="font-bold text-text-primary text-[22px] tracking-[-0.025em] truncate leading-tight">
          {heading}
        </h3>
        {!isDeletedView && (
          <button
            onClick={() => createNote()}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-accent-icon hover:bg-hover transition-colors cursor-pointer flex-shrink-0"
            aria-label="Catatan baru"
            title="Catatan baru (Ctrl+N)"
          >
            <SquarePen className="w-[20px] h-[20px]" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <SearchBar />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2">
        {notes === undefined ? (
          <NotesListSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState
            type={isDeletedView ? "recently-deleted" : searchQuery ? "search" : "folder"}
            query={searchQuery}
          />
        ) : (
          <>
            {pinned.length > 0 && (
              <Group label="Tersemat">
                {pinned.map((n) => (
                  <NoteRow
                    key={n.id}
                    title={n.title}
                    snippet={snippetFrom(n.contentText)}
                    date={relativeDate(n.updatedAt)}
                    pinned={n.pinned}
                    active={activeNoteId === n.id}
                    locked={n.locked}
                    onClick={() => setActiveNoteId(n.id)}
                    onTogglePin={() => togglePin(n.id)}
                    onDelete={() => deleteNote(n.id)}
                  />
                ))}
              </Group>
            )}

            <Group label={pinned.length > 0 ? (searchQuery ? "Hasil" : "Catatan") : undefined}>
              {rest.map((n) => (
                <NoteRow
                  key={n.id}
                  title={n.title}
                  snippet={snippetFrom(n.contentText)}
                  date={relativeDate(isDeletedView ? n.deletedAt ?? n.updatedAt : n.updatedAt)}
                  pinned={n.pinned}
                  active={activeNoteId === n.id}
                  locked={n.locked}
                  deleted={isDeletedView}
                  onClick={() => setActiveNoteId(n.id)}
                  onTogglePin={() => togglePin(n.id)}
                  onDelete={() => deleteNote(n.id)}
                  onRestore={() => restoreNote(n.id)}
                  onPurge={() => purgeNote(n.id)}
                />
              ))}
            </Group>
          </>
        )}
      </div>

      {/* Footer: note count */}
      {total > 0 && (
        <div className="flex-shrink-0 h-[36px] flex items-center justify-center border-t border-separator">
          <span className="text-text-secondary text-[12px] tabular-nums">
            {total} Catatan
          </span>
        </div>
      )}
    </div>
  );
}

function NotesListSkeleton() {
  return (
    <div className="animate-fade-in px-2" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="px-4 py-3">
          <div className="h-3.5 w-2/5 rounded bg-separator/80 animate-pulse mb-2" />
          <div className="h-3 w-3/4 rounded bg-separator/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Group({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      {label && (
        <div className="px-4 pt-3 pb-1.5">
          <span className="text-text-secondary text-[11px] font-bold uppercase tracking-[0.06em]">
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
