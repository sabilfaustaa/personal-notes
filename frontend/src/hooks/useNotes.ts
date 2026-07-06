"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, generateId, emptyDoc, type LocalNote, type LocalFolder } from "@/features/db";
import { useUIStore } from "@/lib/store";
import { extractTitle, extractTags, proseMirrorToText } from "@apple-notes/shared";
import { encryptJson, decryptJson } from "@/lib/crypto";

// ── Notes list (terfilter folder/collection/search + sort) ──

export function useNotes(): LocalNote[] | undefined {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const activeFolderId = useUIStore((s) => s.activeFolderId);
  const activeTag = useUIStore((s) => s.activeTag);
  const activeCollection = useUIStore((s) => s.activeCollection);
  const sortMode = useUIStore((s) => s.sortMode);

  return useLiveQuery(async () => {
    let collection = await db.notes.toArray();

    if (activeCollection === "recently-deleted") {
      collection = collection.filter((n) => n.deletedAt !== null);
    } else {
      collection = collection.filter((n) => n.deletedAt === null);
      if (activeFolderId) {
        collection = collection.filter((n) => n.folderId === activeFolderId);
      }
      if (activeTag) {
        collection = collection.filter((n) => extractTags(n.contentText).includes(activeTag));
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      collection = collection.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.contentText.toLowerCase().includes(q),
      );
    }

    collection.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      switch (sortMode) {
        case "dateCreated":
          return b.createdAt.localeCompare(a.createdAt);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "dateEdited":
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });

    return collection;
  }, [searchQuery, activeFolderId, activeTag, activeCollection, sortMode]);
}

/** Daftar tag unik (dengan jumlah) dari semua catatan aktif & tidak terkunci. */
export function useTags(): { tag: string; count: number }[] {
  return (
    useLiveQuery(async () => {
      const notes = await db.notes.filter((n) => n.deletedAt === null && !n.locked).toArray();
      const counts = new Map<string, number>();
      for (const n of notes) {
        for (const tag of extractTags(n.contentText)) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
      return Array.from(counts, ([tag, count]) => ({ tag, count })).sort((a, b) =>
        a.tag.localeCompare(b.tag),
      );
    }, []) ?? []
  );
}

export function useNote(id: string | null) {
  return useLiveQuery(async () => {
    if (!id) return null;
    return (await db.notes.get(id)) ?? null;
  }, [id]);
}

// ── Mutasi catatan ─────────────────────────────────

export function useCreateNote() {
  const setActiveNoteId = useUIStore((s) => s.setActiveNoteId);
  const activeFolderId = useUIStore((s) => s.activeFolderId);

  return async () => {
    const id = generateId();
    const now = new Date().toISOString();
    const note: LocalNote = {
      id,
      folderId: activeFolderId,
      title: "",
      contentJson: emptyDoc(),
      contentText: "",
      pinned: false,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await db.notes.add(note);
    setActiveNoteId(id);
    return id;
  };
}

export function useUpdateNote() {
  return async (id: string, updates: Partial<LocalNote>) => {
    const existing = await db.notes.get(id);
    if (!existing) return;

    const patch: Partial<LocalNote> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.contentJson) {
      const text = proseMirrorToText(updates.contentJson);
      patch.contentText = text;
      patch.title = extractTitle(text);
    }

    await db.notes.update(id, patch);
  };
}

export function useTogglePin() {
  return async (id: string) => {
    const existing = await db.notes.get(id);
    if (!existing) return;
    await db.notes.update(id, {
      pinned: !existing.pinned,
      updatedAt: new Date().toISOString(),
    });
  };
}

export function useDeleteNote() {
  return async (id: string) => {
    await db.notes.update(id, { deletedAt: new Date().toISOString() });
  };
}

export function useRestoreNote() {
  return async (id: string) => {
    await db.notes.update(id, { deletedAt: null, updatedAt: new Date().toISOString() });
  };
}

/** Hapus permanen dari Recently Deleted. */
export function usePurgeNote() {
  return async (id: string) => {
    await db.notes.delete(id);
  };
}

// ── Kunci catatan (enkripsi lokal) ─────────────────

/** Kunci catatan: enkripsi contentJson dengan passcode, kosongkan teks biasa. */
export function useLockNote() {
  return async (id: string, passcode: string) => {
    const n = await db.notes.get(id);
    if (!n || n.locked) return;
    const enc = await encryptJson(passcode, { contentJson: n.contentJson });
    await db.notes.update(id, {
      locked: true,
      enc,
      contentJson: emptyDoc(),
      contentText: "",
      updatedAt: new Date().toISOString(),
    });
  };
}

/** Buka kunci: dekripsi & kembalikan ke teks biasa. Lempar error bila passcode salah. */
export function useUnlockNote() {
  return async (id: string, passcode: string) => {
    const n = await db.notes.get(id);
    if (!n || !n.locked || !n.enc) return;
    const decrypted = await decryptJson(passcode, n.enc); // throws bila salah
    const contentJson = (decrypted.contentJson as Record<string, unknown>) ?? emptyDoc();
    const text = proseMirrorToText(contentJson);
    await db.notes.update(id, {
      locked: false,
      enc: null,
      contentJson,
      contentText: text,
      title: extractTitle(text),
      updatedAt: new Date().toISOString(),
    });
  };
}

// ── Folder ─────────────────────────────────────────

export interface FolderWithCount extends LocalFolder {
  count: number;
}

export function useFolders(): FolderWithCount[] | undefined {
  return useLiveQuery(async () => {
    const [folders, notes] = await Promise.all([
      db.folders.orderBy("sortOrder").toArray(),
      db.notes.filter((n) => n.deletedAt === null).toArray(),
    ]);
    return folders.map((f) => ({
      ...f,
      count: notes.filter((n) => n.folderId === f.id).length,
    }));
  }, []);
}

/** Jumlah catatan aktif (All Notes) & Recently Deleted. */
export function useCounts() {
  return (
    useLiveQuery(async () => {
      const notes = await db.notes.toArray();
      return {
        all: notes.filter((n) => n.deletedAt === null).length,
        deleted: notes.filter((n) => n.deletedAt !== null).length,
      };
    }, []) ?? { all: 0, deleted: 0 }
  );
}

export function useCreateFolder() {
  return async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const id = generateId();
    const now = new Date().toISOString();
    const count = await db.folders.count();
    await db.folders.add({ id, name: trimmed, sortOrder: count, createdAt: now, updatedAt: now });
    return id;
  };
}

export function useRenameFolder() {
  return async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.folders.update(id, { name: trimmed, updatedAt: new Date().toISOString() });
  };
}

/** Hapus folder; catatan di dalamnya dipindah ke "All Notes" (folderId null). */
export function useDeleteFolder() {
  return async (id: string) => {
    const notes = await db.notes.where("folderId").equals(id).toArray();
    await Promise.all(notes.map((n) => db.notes.update(n.id, { folderId: null })));
    await db.folders.delete(id);
  };
}
