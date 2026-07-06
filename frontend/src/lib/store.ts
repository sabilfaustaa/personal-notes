"use client";

import { create } from "zustand";
import type { ThemeMode, ViewMode, SortMode } from "@apple-notes/shared";

// ── UI State ────────────────────────────────────────

interface UIState {
  /** Catatan yang sedang dipilih (buka di editor) */
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;

  /** Folder yang sedang aktif di sidebar */
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;

  /** Tag yang sedang aktif (filter), tanpa tanda pagar */
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;

  /** Koleksi virtual yang sedang aktif */
  activeCollection: "all" | "recently-deleted";
  setActiveCollection: (col: "all" | "recently-deleted") => void;

  /** Query pencarian */
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  /** Mode tampilan per folder */
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  /** Mode sortir */
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;

  /** Sidebar terbuka (mobile/tablet) */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNoteId: null,
  setActiveNoteId: (id) => set({ activeNoteId: id }),

  activeFolderId: null,
  setActiveFolderId: (id) =>
    set({ activeFolderId: id, activeCollection: "all", activeTag: null }),

  activeTag: null,
  setActiveTag: (tag) =>
    set({ activeTag: tag, activeCollection: "all", activeFolderId: null, activeNoteId: null }),

  activeCollection: "all",
  setActiveCollection: (col) =>
    set({ activeCollection: col, activeFolderId: null, activeTag: null, activeNoteId: null }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  viewMode: "list",
  setViewMode: (mode) => set({ viewMode: mode }),

  sortMode: "dateEdited",
  setSortMode: (mode) => set({ sortMode: mode }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ── Save State (indikator lokal) ────────────────────

export type SaveStatus = "saved" | "saving";

interface SaveState {
  status: SaveStatus;
  setStatus: (s: SaveStatus) => void;
}

export const useSaveStore = create<SaveState>((set) => ({
  status: "saved",
  setStatus: (s) => set({ status: s }),
}));
