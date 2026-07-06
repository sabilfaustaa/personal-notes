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
  Heading1,
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
        p-[7px] rounded-md transition-colors duration-100 flex-shrink-0
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          active
            ? "bg-accent/20 text-accent-strong"
            : "text-text-secondary hover:bg-hover hover:text-text-primary"
        }
      `}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-separator mx-1" />;
}

export function FormatToolbar({ editor, onInsertImage }: FormatToolbarProps) {
  if (!editor) {
    return (
      <div className="flex items-center gap-1 px-3">
        <div className="flex items-center gap-1 opacity-40">
          <Bold className="w-[18px] h-[18px]" />
          <Italic className="w-[18px] h-[18px]" />
          <UnderlineIcon className="w-[18px] h-[18px]" />
          <Strikethrough className="w-[18px] h-[18px]" />
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
        <Undo2 className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        label="Redo"
      >
        <Redo2 className="w-[18px] h-[18px]" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Inline format */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Bold (Ctrl+B)"
      >
        <Bold className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italic (Ctrl+I)"
      >
        <Italic className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="Strikethrough"
      >
        <Strikethrough className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        label="Highlight"
      >
        <Highlighter className="w-[18px] h-[18px]" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading styles */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label="Title"
      >
        <Heading1 className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Heading"
      >
        <Heading2 className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Subheading"
      >
        <Heading3 className="w-[18px] h-[18px]" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Bullet list"
      >
        <List className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Numbered list"
      >
        <ListOrdered className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        label="Checklist"
      >
        <ListChecks className="w-[18px] h-[18px]" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Block quote"
      >
        <Quote className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="Code block"
      >
        <Code className="w-[18px] h-[18px]" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Divider"
      >
        <Minus className="w-[18px] h-[18px]" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Gambar inline */}
      <ToolbarButton onClick={() => onInsertImage?.()} label="Sisipkan gambar">
        <Image className="w-[18px] h-[18px]" />
      </ToolbarButton>
    </div>
  );
}
