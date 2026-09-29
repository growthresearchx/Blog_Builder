"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { EditorStatsBar } from "./editor-stats-bar";
import { useEffect } from "react";
import type { EditorProps } from "@/types/editor";

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Write your blog story here...",
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4 border",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || "",
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[350px] md:min-h-[450px] p-4 focus:outline-none font-normal text-base",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  return (
    <div className="border rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 shadow-xs">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <EditorStatsBar content={content || ""} />
    </div>
  );
}
