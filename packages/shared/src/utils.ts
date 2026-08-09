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

type ProseMirrorNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: ProseMirrorNode[];
};

const LIST_TYPES = new Set(["bulletList", "orderedList", "taskList"]);

/**
 * Konversi potongan ProseMirror menjadi teks yang rapi saat disalin.
 *
 * Berbeda dari `proseMirrorToText` (yang ditujukan untuk pencarian), fungsi ini
 * mempertahankan struktur yang penting bagi pembaca: bullet, nomor, checklist,
 * kutipan, dan code block. Setiap blok hanya dipisahkan satu newline agar hasil
 * paste tidak memiliki jarak kosong berlebihan.
 */
export function proseMirrorToClipboardText(
  doc: Record<string, unknown> | readonly Record<string, unknown>[] | null | undefined,
): string {
  if (!doc) return "";

  const nodes = (Array.isArray(doc) ? doc : [doc]) as ProseMirrorNode[];
  return tidyClipboardText(serializeBlocks(nodes, 0));
}

function serializeBlocks(nodes: ProseMirrorNode[], depth: number): string {
  return nodes
    .map((node) => serializeBlock(node, depth))
    .filter((text) => text.length > 0)
    .join("\n");
}

function serializeBlock(node: ProseMirrorNode, depth: number): string {
  const content = node.content ?? [];

  switch (node.type) {
    case "doc":
      return serializeBlocks(content, depth);
    case "text":
      return node.text ?? "";
    case "hardBreak":
      return "\n";
    case "paragraph":
    case "heading":
      return serializeInline(content);
    case "bulletList":
      return serializeList(content, "bullet", depth, 1);
    case "orderedList":
      return serializeList(content, "ordered", depth, numericAttr(node, "start", 1));
    case "taskList":
      return serializeList(content, "task", depth, 1);
    case "blockquote": {
      const quote = serializeBlocks(content, depth);
      return quote
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n");
    }
    case "codeBlock": {
      const language = stringAttr(node, "language");
      return `\`\`\`${language}\n${serializeInline(content)}\n\`\`\``;
    }
    case "horizontalRule":
      return "---";
    case "image": {
      const alt = stringAttr(node, "alt") || stringAttr(node, "title");
      const src = stringAttr(node, "src");
      if (alt && src) return `![${alt}](${src})`;
      return alt || src;
    }
    case "listItem":
    case "taskItem":
      return serializeListItem(node, "-", depth);
    default:
      return content.length > 0 ? serializeBlocks(content, depth) : "";
  }
}

function serializeInline(nodes: ProseMirrorNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.text ?? "";
      if (node.type === "hardBreak") return "\n";
      if (node.type === "image") return serializeBlock(node, 0);
      return node.content ? serializeInline(node.content) : "";
    })
    .join("");
}

function serializeList(
  items: ProseMirrorNode[],
  kind: "bullet" | "ordered" | "task",
  depth: number,
  start: number,
): string {
  return items
    .map((item, index) => {
      const marker =
        kind === "ordered"
          ? `${start + index}.`
          : kind === "task"
            ? `- [${item.attrs?.checked === true ? "X" : " "}]`
            : "-";
      return serializeListItem(item, marker, depth);
    })
    .join("\n");
}

function serializeListItem(item: ProseMirrorNode, marker: string, depth: number): string {
  const content = item.content ?? [];
  const bodyNodes = content.filter((node) => !LIST_TYPES.has(node.type ?? ""));
  const nestedLists = content.filter((node) => LIST_TYPES.has(node.type ?? ""));
  const body = serializeBlocks(bodyNodes, depth).trim();
  const indentation = "  ".repeat(depth);
  const continuation = `${indentation}${" ".repeat(marker.length + 1)}`;
  const bodyLines = (body || " ").split("\n");
  const lines = [
    `${indentation}${marker} ${bodyLines[0]}`.trimEnd(),
    ...bodyLines.slice(1).map((line) => `${continuation}${line}`.trimEnd()),
  ];

  for (const nested of nestedLists) {
    lines.push(serializeBlock(nested, depth + 1));
  }

  return lines.join("\n");
}

function numericAttr(node: ProseMirrorNode, name: string, fallback: number): number {
  const value = node.attrs?.[name];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringAttr(node: ProseMirrorNode, name: string): string {
  const value = node.attrs?.[name];
  return typeof value === "string" ? value : "";
}

function tidyClipboardText(text: string): string {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd());
  const result: string[] = [];

  for (const line of lines) {
    // Maksimal satu baris kosong berturut-turut.
    if (line === "" && result[result.length - 1] === "") continue;
    result.push(line);
  }

  while (result[0] === "") result.shift();
  while (result[result.length - 1] === "") result.pop();
  return result.join("\n");
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
