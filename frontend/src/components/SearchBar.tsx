"use client";

import { useUIStore } from "@/lib/store";
import { Search, X } from "lucide-react";
import { SEARCH_INPUT_ID } from "@/hooks/useKeyboardShortcuts";

export function SearchBar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  return (
    <div className="group relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-tertiary pointer-events-none" />
      <input
        id={SEARCH_INPUT_ID}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setSearchQuery("");
            e.currentTarget.blur();
          }
        }}
        placeholder="Cari"
        aria-label="Cari catatan"
        className="w-full h-[34px] pl-9 pr-9 rounded-xl bg-field border border-transparent
                   text-text-primary text-[14px] placeholder:text-text-tertiary
                   focus:outline-none focus:bg-bg-elevated focus:border-accent/50
                   transition-colors"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full
                     bg-text-tertiary/60 hover:bg-text-secondary transition-colors"
          aria-label="Bersihkan pencarian"
        >
          <X className="w-3 h-3 text-bg-app" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
