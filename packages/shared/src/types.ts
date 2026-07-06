// ── Entitas Inti ──────────────────────────────────────

export interface User {
  id: string;
  email: string;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  contentJson: Record<string, unknown>; // ProseMirror JSON doc
  contentText: string;
  pinned: boolean;
  locked: boolean;
  sortOrder: number;
  version: number;
  clientUpdatedAt: string | null;
  serverUpdatedAt: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  contentJson: Record<string, unknown>;
  contentText: string;
  reason: "conflict-losing" | "manual-history";
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
}

export interface NoteTag {
  noteId: string;
  tagId: string;
}

export interface Attachment {
  id: string;
  noteId: string;
  userId: string;
  mime: string;
  size: number;
  storageKey: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

// ── Sync ─────────────────────────────────────────────

export type MutationOp = "create" | "update" | "delete";

export interface Mutation {
  mutationId: string; // UUID v4
  entity: "note" | "folder" | "tag" | "attachment";
  op: MutationOp;
  entityId: string;
  baseVersion: number;
  clientUpdatedAt: string;
  payload: Record<string, unknown>;
}

export type MutationStatus =
  | "applied"
  | "conflict-merged"
  | "conflict-lww"
  | "idempotent-skip"
  | "rejected";

export interface MutationResult {
  mutationId: string;
  status: MutationStatus;
  serverEntity?: Record<string, unknown>;
  conflict?: {
    serverVersion: number;
    losingCopyId?: string;
  };
}

export interface SyncPullResponse {
  changes: {
    notes: Note[];
    folders: Folder[];
    tags: Tag[];
    attachments: Attachment[];
  };
  nextCursor: string;
  hasMore: boolean;
}

export interface SyncPushRequest {
  mutations: Mutation[];
}

export interface SyncPushResponse {
  results: MutationResult[];
  serverCursor: string;
}

// ── Auth ─────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ── API Error ────────────────────────────────────────

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ── Preferensi ───────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system";
export type ViewMode = "list" | "gallery";
export type SortMode = "dateEdited" | "dateCreated" | "title";

export interface UserPreferences {
  theme: ThemeMode;
  viewMode: ViewMode;
  sort: SortMode;
}
