"use client";

import { Lock, Pin } from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";

interface NoteRowProps {
  title: string;
  snippet: string;
  date: string;
  pinned: boolean;
  active: boolean;
  locked?: boolean;
  deleted?: boolean;
  onClick: () => void;
  onTogglePin?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onPurge?: () => void;
}

export function NoteRow({
  title,
  snippet,
  date,
  pinned,
  active,
  locked = false,
  deleted = false,
  onClick,
  onTogglePin,
  onDelete,
  onRestore,
  onPurge,
}: NoteRowProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <button
          onClick={onClick}
          aria-current={active ? "true" : undefined}
          className={`
            relative w-full text-left rounded-xl cursor-pointer
            transition-colors duration-100
            ${active ? "bg-selection" : "hover:bg-hover"}
          `}
        >
          <div className="px-4 py-3">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-semibold text-[15px] leading-snug truncate flex-1 text-text-primary">
                {title || "Catatan Baru"}
              </h4>
              {pinned && (
                <Pin className="w-3.5 h-3.5 text-accent flex-shrink-0 fill-accent rotate-45" />
              )}
            </div>

            {/* Meta row: date + snippet */}
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[12px] font-medium leading-snug text-text-secondary flex-shrink-0 tabular-nums">
                {date}
              </span>
              {locked ? (
                <span className="text-[12px] leading-snug text-text-tertiary truncate flex items-center gap-1">
                  <Lock className="w-3 h-3 flex-shrink-0" />
                  Terkunci
                </span>
              ) : (
                <span className="text-[12px] leading-snug text-text-tertiary truncate">
                  {snippet || "Tidak ada teks tambahan"}
                </span>
              )}
            </div>
          </div>

          {/* Hairline separator — inset, hidden on selected rows */}
          {!active && (
            <span className="pointer-events-none absolute bottom-0 left-4 right-0 h-px bg-separator/60" />
          )}
        </button>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[190px] bg-bg-elevated/95 backdrop-blur-xl rounded-xl shadow-popover border border-separator p-1 z-50 animate-pop-in">
          {!deleted ? (
            <>
              <MenuItem onSelect={onTogglePin}>{pinned ? "Lepas Sematan" : "Sematkan"}</MenuItem>
              <ContextMenu.Separator className="h-px bg-separator my-1" />
              <MenuItem danger onSelect={onDelete}>
                Hapus
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onSelect={onRestore}>Pulihkan</MenuItem>
              <ContextMenu.Separator className="h-px bg-separator my-1" />
              <MenuItem danger onSelect={onPurge}>
                Hapus Permanen
              </MenuItem>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function MenuItem({
  children,
  onSelect,
  danger = false,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
}) {
  return (
    <ContextMenu.Item
      onSelect={() => onSelect?.()}
      className={`text-[13px] px-3 py-2 rounded-md cursor-pointer outline-none transition-colors
        ${
          danger
            ? "text-danger data-[highlighted]:bg-danger data-[highlighted]:text-white"
            : "text-text-primary data-[highlighted]:bg-accent data-[highlighted]:text-white"
        }`}
    >
      {children}
    </ContextMenu.Item>
  );
}
