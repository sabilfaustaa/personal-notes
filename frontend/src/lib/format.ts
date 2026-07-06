/** Util format tampilan — tanggal relatif & snippet, gaya Apple Notes. */

export function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m`;

  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Kemarin";

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString("id-ID", { weekday: "long" });
  }
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** Tanggal panjang untuk header editor: "3 Juni 2026 · 10.24". */
export function longDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

/** Snippet baris kedua: buang baris judul, ringkas. */
export function snippetFrom(contentText: string): string {
  const lines = contentText.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.slice(1).join(" ").slice(0, 120);
}

export function wordCount(contentText: string): number {
  const t = contentText.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}
