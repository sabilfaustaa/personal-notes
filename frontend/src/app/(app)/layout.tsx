"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { NotesList } from "@/components/NotesList";
import { Editor } from "@/components/Editor";
import { SyncStatus } from "@/components/SyncStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PwaControls } from "@/components/PwaControls";
import { seedIfNeeded } from "@/features/db";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { PanelLeft, X } from "lucide-react";

export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const activeNoteId = useUIStore((s) => s.activeNoteId);

  useKeyboardShortcuts();

  useEffect(() => {
    seedIfNeeded();
  }, []);

  return (
    <div className="flex h-screen bg-bg-app overflow-hidden text-text-primary">
      {/* ── Folders sidebar ───────────────────────── */}
      <aside
        className={`
          flex-shrink-0 w-[260px] bg-bg-sidebar
          flex flex-col transition-transform duration-200 ease-out
          border-r border-separator
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed lg:static inset-y-0 left-0 z-30
        `}
      >
        {/* Title bar */}
        <div className="h-[56px] flex-shrink-0 flex items-center justify-between pl-4 pr-2 select-none border-b border-separator/50">
          <h2 className="font-bold text-[17px] text-text-primary tracking-[-0.01em]">
            Folder
          </h2>
          <div className="flex items-center gap-1">
            <PwaControls />
            <ThemeToggle />
            <SyncStatus />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors"
              aria-label="Tutup sidebar"
            >
              <X className="w-[18px] h-[18px] text-text-secondary" />
            </button>
          </div>
        </div>
        <Sidebar />
      </aside>

      {/* ── Overlay mobile ────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Notes list ────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 w-[300px] bg-bg-list border-r border-separator
          flex flex-col
          ${activeNoteId ? "hidden md:flex" : "flex"}
        `}
      >
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden flex items-center h-[56px] px-4 border-b border-separator/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2.5 text-accent font-semibold text-[15px]"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-[18px] h-[18px]" />
            <span>Folder</span>
          </button>
        </div>
        <NotesList />
      </div>

      {/* ── Editor ────────────────────────────────── */}
      <div
        key={activeNoteId ?? "empty"}
        className="flex-1 flex flex-col min-w-0 bg-bg-app animate-fade-in"
      >
        {/* Mobile: back button saat ada note aktif */}
        {activeNoteId && (
          <div className="flex items-center h-[56px] px-3 md:hidden border-b border-separator/50">
            <button
              onClick={() => {
                useUIStore.getState().setActiveNoteId(null);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-1 text-accent text-[15px] font-semibold px-2 py-1.5 rounded-lg hover:bg-hover transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
              Catatan
            </button>
          </div>
        )}
        <Editor />
      </div>
    </div>
  );
}
