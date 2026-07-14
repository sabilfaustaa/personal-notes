"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  ListChecks,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Image,
} from "lucide-react";

interface FormatToolbarProps {
  editor: Editor | null;
  onInsertImage?: () => void;
}

const ICON = "w-5 h-5";

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`
        p-2 rounded-lg transition-colors duration-100 flex-shrink-0
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          active
            ? "bg-accent/15 text-accent-strong"
            : "text-text-secondary hover:bg-hover hover:text-text-primary"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-separator mx-1.5 flex-shrink-0" />;
}

export function FormatToolbar({ editor, onInsertImage }: FormatToolbarProps) {
  if (!editor) {
    return (
      <div className="flex items-center gap-1 px-3">
        <div className="flex items-center gap-1 opacity-40">
          <Bold className={ICON} />
          <Italic className={ICON} />
          <UnderlineIcon className={ICON} />
          <Strikethrough className={ICON} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 px-3 overflow-x-auto no-scrollbar">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        label="Undo"
      >
        <Undo2 className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        label="Redo"
      >
        <Redo2 className={ICON} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Inline format */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold (Ctrl+B)"
      >
        <Bold className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic (Ctrl+I)"
      >
        <Italic className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Underline (Ctrl+U)"
      >
        <UnderlineIcon className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Strikethrough"
      >
        <Strikethrough className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        label="Highlight"
      >
        <Highlighter className={ICON} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading (H1 khusus baris judul, tidak di toolbar) */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Judul bagian"
      >
        <Heading2 className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Subjudul"
      >
        <Heading3 className={ICON} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Daftar poin"
      >
        <List className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Daftar bernomor"
      >
        <ListOrdered className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        label="Checklist"
      >
        <ListChecks className={ICON} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Kutipan"
      >
        <Quote className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="Blok kode"
      >
        <Code className={ICON} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Garis pemisah"
      >
        <Minus className={ICON} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Gambar inline */}
      <ToolbarButton onClick={() => onInsertImage?.()} label="Sisipkan gambar">
        <Image className={ICON} />
      </ToolbarButton>
    </div>
  );
}
