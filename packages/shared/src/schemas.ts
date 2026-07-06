import { z } from "zod";

// ── Auth ─────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = registerSchema;

// ── Note ─────────────────────────────────────────────

export const createNoteSchema = z.object({
  folderId: z.string().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().optional(),
  contentJson: z.record(z.unknown()).optional(),
  contentText: z.string().optional(),
  pinned: z.boolean().optional(),
  locked: z.boolean().optional(),
  folderId: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
  clientUpdatedAt: z.string().optional(),
  baseVersion: z.number(),
});

// ── Folder ───────────────────────────────────────────

export const createFolderSchema = z.object({
  name: z.string().min(1, "Nama folder wajib diisi"),
  parentId: z.string().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

export const deleteFolderSchema = z.object({
  strategy: z.enum(["move", "trash"]).optional(),
});

// ── Attachment ───────────────────────────────────────

export const presignRequestSchema = z.object({
  noteId: z.string(),
  mime: z.string(),
  size: z.number(),
});

export const confirmAttachmentSchema = z.object({
  noteId: z.string(),
  storageKey: z.string(),
  mime: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// ── Sync ─────────────────────────────────────────────

export const mutationSchema = z.object({
  mutationId: z.string().uuid(),
  entity: z.enum(["note", "folder", "tag", "attachment"]),
  op: z.enum(["create", "update", "delete"]),
  entityId: z.string(),
  baseVersion: z.number(),
  clientUpdatedAt: z.string(),
  payload: z.record(z.unknown()),
});

export const syncPushSchema = z.object({
  mutations: z.array(mutationSchema),
});

// ── Preferences ──────────────────────────────────────

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  viewMode: z.enum(["list", "gallery"]).optional(),
  sort: z.enum(["dateEdited", "dateCreated", "title"]).optional(),
});
