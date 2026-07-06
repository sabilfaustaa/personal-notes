"use client";

import { StickyNote, FolderOpen, Search, Trash2 } from "lucide-react";

interface EmptyStateProps {
  type: "all" | "folder" | "search" | "recently-deleted" | "editor";
  query?: string;
}

const configs = {
  all: {
    icon: StickyNote,
    title: "Belum ada catatan",
    description: "Tekan ＋ untuk membuat catatan pertama.",
  },
  folder: {
    icon: FolderOpen,
    title: "Folder ini masih kosong",
    description: "Buat catatan baru di folder ini.",
  },
  search: {
    icon: Search,
    title: "Tidak ada hasil",
    description: "", // akan di-override
  },
  "recently-deleted": {
    icon: Trash2,
    title: "Tidak ada yang baru dihapus",
    description: "Catatan yang dihapus akan muncul di sini selama 30 hari.",
  },
  editor: {
    icon: StickyNote,
    title: "Pilih catatan",
    description: "Pilih catatan dari daftar, atau tekan Ctrl+N untuk membuat yang baru.",
  },
};

export function EmptyState({ type, query }: EmptyStateProps) {
  const cfg = configs[type];
  const Icon = cfg.icon;
  const description =
    type === "search" && query ? `Tidak ada hasil untuk "${query}".` : cfg.description;

  const isEditor = type === "editor";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center animate-fade-in select-none">
      <div
        className={`flex items-center justify-center mb-4 ${
          isEditor ? "w-20 h-20" : "w-16 h-16 rounded-2xl bg-hover"
        }`}
      >
        <Icon
          className={
            isEditor
              ? "w-16 h-16 text-text-tertiary/50"
              : "w-8 h-8 text-text-secondary"
          }
          strokeWidth={isEditor ? 1.25 : 2}
        />
      </div>
      <h3
        className={`font-semibold mb-1 ${
          isEditor ? "text-text-secondary text-[15px]" : "text-text-primary text-lg"
        }`}
      >
        {cfg.title}
      </h3>
      <p className="text-text-secondary text-[13px] max-w-[260px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
