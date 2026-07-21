"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageExt from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImageIcon,
  Code,
  Quote,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  name: string;
}

export default function RichTextEditor({ value, onChange, name }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExt.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Write your blog content here…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none w-full min-h-[400px] p-4 focus:outline-none text-sm leading-relaxed",
      },
    },
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          toast.error(data.error ?? "Upload failed.");
          return;
        }
        editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        toast.success("Image uploaded!");
      } catch {
        toast.error("Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[#2F80ED] text-white"
          : "text-slate-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full border border-white/15 rounded-lg overflow-hidden bg-[#0B1F3A]">
      {/* Hidden input to carry value into FormData */}
      <input type="hidden" name={name} value={editor.getHTML()} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/10 bg-[#102A43]">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <Underline size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Insert Link">
          <Link2 size={14} />
        </ToolBtn>

        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          title="Upload Image"
          active={false}
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ImageIcon size={14} />
          )}
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Editor area */}
      <div className="w-full">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}
