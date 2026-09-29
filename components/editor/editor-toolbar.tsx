"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
  Check,
} from "lucide-react";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) return null;

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    }
    setLinkModalOpen(false);
  };

  const handleOpenImageModal = () => {
    setImageUrl("");
    setImageModalOpen(true);
  };

  const handleApplyImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
    setImageModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 border-b p-2 bg-muted/30 dark:bg-muted/10 rounded-t-md overflow-x-auto sm:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("heading", { level: 1 }) ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Heading 1 (Ctrl+Alt+1)"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("heading", { level: 2 }) ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("heading", { level: 3 }) ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

        {/* Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("bold") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("italic") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("bulletList") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("orderedList") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

        {/* Code & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("codeBlock") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Code Block (Ctrl+Alt+C)"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("blockquote") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Quote Block (Ctrl+Shift+B)"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

        {/* Link & Image */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className={`p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            editor.isActive("link") ? "bg-muted font-bold text-primary" : ""
          }`}
          title="Insert Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-destructive"
            title="Remove Hyperlink"
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleOpenImageModal}
          className="p-1.5 rounded hover:bg-muted flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Insert Image URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

        {/* Undo & Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-30 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-muted disabled:opacity-30 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* In-App Link Inserter Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Insert Hyperlink"
      >
        <form onSubmit={handleApplyLink} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="link-url-input">Target Web Address (URL)</label>
            <Input
              id="link-url-input"
              type="url"
              placeholder="https://example.com/article"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="h-4 w-4" />
              Apply Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* In-App Image Inserter Modal */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Insert Image from URL"
      >
        <form onSubmit={handleApplyImage} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="image-url-input">Image Web Address (URL)</label>
            <Input
              id="image-url-input"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Check className="h-4 w-4" />
              Insert Image
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
