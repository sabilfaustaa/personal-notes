/**
 * Konversi ProseMirror JSON → plaintext untuk FTS & search.
 * Rekursif mengekstrak teks dari node doc + children.
 */
export function proseMirrorToText(doc: Record<string, unknown> | null | undefined): string {
  if (!doc) return "";

  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (node.text && typeof node.text === "string") {
      parts.push(node.text);
    }
    // hard_break → newline
    if (node.type === "hardBreak") {
      parts.push("\n");
    }
    // paragraph, heading, list_item → newline setelah (kecuali yg terakhir)
    const blockTypes = new Set([
      "paragraph",
      "heading",
      "listItem",
      "bulletList",
      "orderedList",
      "taskList",
      "taskItem",
      "blockquote",
      "codeBlock",
      "table",
      "tableRow",
      "tableCell",
      "horizontalRule",
    ]);

    if (Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        const child = node.content[i] as Record<string, unknown>;
        walk(child);
        // Tambah newline setelah block node (kecuali elemen terakhir)
        if (blockTypes.has(child.type as string) && i < node.content.length - 1) {
          // Cek apakah child berikutnya juga block
          const next = node.content[i + 1] as Record<string, unknown> | undefined;
          if (next && blockTypes.has(next.type as string)) {
            parts.push("\n");
          }
        }
      }
    }
  }

  walk(doc);
  return parts.join("");
}

/**
 * Ekstrak judul = baris pertama dari plaintext.
 */
export function extractTitle(plaintext: string): string {
  const firstLine = plaintext.split("\n")[0];
  return firstLine ? firstLine.trim().slice(0, 200) : "";
}

/**
 * Ekstrak tag `#kata` dari plaintext (huruf, angka, _, -). Unik, lowercase,
 * tanpa tanda pagar. Dipakai untuk daftar tag di sidebar & filter.
 */
export function extractTags(plaintext: string): string[] {
  const matches = plaintext.match(/(?:^|\s)#([\p{L}\p{N}_-]{1,50})/gu) ?? [];
  const tags = matches.map((m) => m.trim().slice(1).toLowerCase());
  return Array.from(new Set(tags));
}

/**
 * Generate mutationId unik untuk outbox.
 * Fallback sederhana bila crypto.randomUUID tidak ada.
 */
export function generateMutationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
