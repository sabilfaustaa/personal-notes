import Dexie, { type EntityTable } from "dexie";

// ── Skema lokal IndexedDB (local-only, tanpa server) ──
// Lihat PLAN-NEW.md §5

/** Payload terenkripsi (AES-GCM) untuk catatan terkunci. */
export interface EncryptedPayload {
  iv: string; // base64
  salt: string; // base64
  data: string; // base64 ciphertext dari { contentJson }
}

export interface LocalNote {
  id: string;
  folderId: string | null;
  title: string;
  contentJson: Record<string, unknown>;
  contentText: string;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Soft delete → Recently Deleted. null = aktif. */
  deletedAt: string | null;
  /** Catatan terkunci: konten dienkripsi, `contentJson`/`contentText` dikosongkan. */
  locked?: boolean;
  enc?: EncryptedPayload | null;
}

export interface LocalFolder {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

// ── Database ────────────────────────────────────────

class NotesDatabase extends Dexie {
  notes!: EntityTable<LocalNote, "id">;
  folders!: EntityTable<LocalFolder, "id">;
  meta!: EntityTable<MetaEntry, "key">;

  constructor() {
    super("NotesDB");

    this.version(1).stores({
      notes: "id, folderId, pinned, deletedAt, updatedAt",
      folders: "id, sortOrder",
      meta: "key",
    });
  }
}

export const db = new NotesDatabase();

// ── Helper: ID & dokumen kosong ────────────────────

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function emptyDoc(): Record<string, unknown> {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

// ── Seed: jalankan sekali saat pertama buka ────────

export async function seedIfNeeded(): Promise<void> {
  const seeded = await db.meta.get("seeded");
  if (seeded) return;

  const now = new Date().toISOString();
  await db.folders.bulkAdd([
    { id: generateId(), name: "Notes", sortOrder: 0, createdAt: now, updatedAt: now },
  ]);

  const welcomeTitle = "Selamat datang di Notes";
  const welcomeBody =
    "Catatan ini tersimpan di perangkatmu dan jalan sepenuhnya offline. Buat catatan baru dengan tombol +.";
  await db.notes.add({
    id: generateId(),
    folderId: null,
    title: welcomeTitle,
    contentJson: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: welcomeTitle }] },
        { type: "paragraph", content: [{ type: "text", text: welcomeBody }] },
      ],
    },
    contentText: welcomeTitle + "\n" + welcomeBody,
    pinned: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  await db.meta.put({ key: "seeded", value: now });
}
