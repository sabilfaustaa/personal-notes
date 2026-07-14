"use client";

import { useUIStore } from "@/lib/store";
import { Folder, Trash2, Plus, Hash, Download, Upload, ChevronRight, Notebook } from "lucide-react";
import { useRef, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  useFolders,
  useCounts,
  useTags,
  useCreateFolder,
  useRenameFolder,
  useDeleteFolder,
} from "@/hooks/useNotes";
import { exportBackup, importBackup } from "@/lib/backup";

export function Sidebar() {
  const activeCollection = useUIStore((s) => s.activeCollection);
  const setActiveCollection = useUIStore((s) => s.setActiveCollection);
  const activeFolderId = useUIStore((s) => s.activeFolderId);
  const setActiveFolderId = useUIStore((s) => s.setActiveFolderId);
  const activeTag = useUIStore((s) => s.activeTag);
  const setActiveTag = useUIStore((s) => s.setActiveTag);

  const folders = useFolders() ?? [];
  const counts = useCounts();
  const tags = useTags();
  const createFolder = useCreateFolder();
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();
  const fileInput = useRef<HTMLInputElement>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await importBackup(file);
    } catch {
      alert("File backup tidak valid.");
    }
  }

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  async function commitCreate() {
    if (draft.trim()) await createFolder(draft);
    setDraft("");
    setCreating(false);
  }

  async function commitRename(id: string) {
    if (editDraft.trim()) await renameFolder(id, editDraft);
    setEditingId(null);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <nav className="flex-1 overflow-y-auto px-2 pb-2" aria-label="Folder">
        {/* â”€â”€ iCloud section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <SectionLabel>iCloud</SectionLabel>

        <Item
          icon={<Notebook className="w-5 h-5" />}
          label="Semua Catatan"
          count={counts.all}
          active={activeCollection === "all" && !activeFolderId && !activeTag}
          onClick={() => setActiveCollection("all")}
        />

        {folders.map((folder) =>
          editingId === folder.id ? (
            <input
              key={folder.id}
              autoFocus
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onBlur={() => commitRename(folder.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(folder.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="w-full my-1 px-3 py-2 rounded-lg bg-bg-elevated border border-accent text-[14px] text-text-primary outline-none"
            />
          ) : (
            <ContextMenu.Root key={folder.id}>
              <ContextMenu.Trigger asChild>
                <div>
                  <Item
                    icon={<Folder className="w-5 h-5" />}
                    label={folder.name}
                    count={folder.count}
                    chevron
                    active={activeFolderId === folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                  />
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-[180px] bg-bg-elevated/95 backdrop-blur-xl rounded-xl shadow-popover border border-separator p-1 z-50 animate-pop-in">
                  <ContextMenu.Item
                    onSelect={() => {
                      setEditingId(folder.id);
                      setEditDraft(folder.name);
                    }}
                    className="text-[13px] px-3 py-2 rounded-md cursor-pointer outline-none data-[highlighted]:bg-accent data-[highlighted]:text-white text-text-primary transition-colors"
                  >
                    Ganti nama
                  </ContextMenu.Item>
                  <ContextMenu.Separator className="h-px bg-separator my-1" />
                  <ContextMenu.Item
                    onSelect={() => {
                      if (activeFolderId === folder.id) setActiveCollection("all");
                      deleteFolder(folder.id);
                    }}
                    className="text-[13px] px-3 py-2 rounded-md cursor-pointer outline-none data-[highlighted]:bg-danger data-[highlighted]:text-white text-danger transition-colors"
                  >
                    Hapus folder
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
          ),
        )}

        {creating && (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitCreate();
              if (e.key === "Escape") {
                setDraft("");
                setCreating(false);
              }
            }}
            placeholder="Nama folder"
            className="w-full my-1 px-3 py-2 rounded-lg bg-bg-elevated border border-accent text-[14px] text-text-primary outline-none placeholder:text-text-secondary"
          />
        )}

        <Item
          icon={<Trash2 className="w-5 h-5" />}
          label="Baru Dihapus"
          count={counts.deleted}
          active={activeCollection === "recently-deleted"}
          onClick={() => setActiveCollection("recently-deleted")}
        />

        {/* â”€â”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {tags.length > 0 && (
          <>
            <SectionLabel>Tag</SectionLabel>
            {tags.map(({ tag, count }) => (
              <Item
                key={tag}
                icon={<Hash className="w-5 h-5" />}
                label={tag}
                count={count}
                active={activeTag === tag}
                onClick={() => setActiveTag(tag)}
              />
            ))}
          </>
        )}
      </nav>

      {/* â”€â”€ Footer: New folder + backup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-shrink-0 border-t border-separator">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2.5 w-full px-4 h-[44px] text-[14px] text-accent-icon hover:text-accent font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-text-secondary group-hover:text-text-primary">Folder Baru</span>
        </button>
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImport}
            aria-hidden="true"
          />
          <FooterBtn onClick={() => exportBackup()} title="Ekspor semua catatan ke file JSON">
            <Download className="w-[17px] h-[17px]" />
            Ekspor
          </FooterBtn>
          <FooterBtn
            onClick={() => fileInput.current?.click()}
            title="Impor catatan dari file JSON"
          >
            <Upload className="w-[17px] h-[17px]" />
            Impor
          </FooterBtn>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1 first:pt-3">
      <span className="text-text-secondary text-[11px] font-semibold uppercase tracking-[0.06em]">
        {children}
      </span>
    </div>
  );
}

function FooterBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-hover hover:text-text-primary transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function Item({
  icon,
  label,
  count,
  active,
  chevron = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  chevron?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`
        group flex items-center gap-3 w-full pl-3 pr-2.5 py-[9px] my-[1px] rounded-lg text-[14px]
        transition-colors duration-100 cursor-pointer
        ${active ? "bg-selection" : "hover:bg-hover"}
      `}
    >
      <span className="text-accent-icon flex-shrink-0">{icon}</span>
      <span
        className={`flex-1 text-left truncate leading-tight ${
          active ? "text-text-primary font-semibold" : "text-text-primary"
        }`}
      >
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-text-secondary text-[13px] tabular-nums font-medium">{count}</span>
      )}
      {chevron && (
        <ChevronRight className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
      )}
    </button>
  );
}
