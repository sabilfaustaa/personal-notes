"use client";

import { db, type LocalNote, type LocalFolder } from "@/features/db";

interface BackupFile {
  app: "notes";
  version: 1;
  exportedAt: string;
  folders: LocalFolder[];
  notes: LocalNote[];
}

/** Unduh seluruh data (folder + catatan, termasuk yang terkunci) sebagai JSON. */
export async function exportBackup(): Promise<void> {
  const [folders, notes] = await Promise.all([db.folders.toArray(), db.notes.toArray()]);
  const payload: BackupFile = {
    app: "notes",
    version: 1,
    exportedAt: new Date().toISOString(),
    folders,
    notes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Impor backup JSON; gabung berdasarkan id (data yang sama ditimpa). */
export async function importBackup(file: File): Promise<{ folders: number; notes: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<BackupFile>;
  if (parsed.app !== "notes" || !Array.isArray(parsed.notes) || !Array.isArray(parsed.folders)) {
    throw new Error("File backup tidak valid.");
  }
  await db.transaction("rw", db.folders, db.notes, async () => {
    await db.folders.bulkPut(parsed.folders as LocalFolder[]);
    await db.notes.bulkPut(parsed.notes as LocalNote[]);
  });
  return { folders: parsed.folders.length, notes: parsed.notes.length };
}
