"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { CoverImageUpload } from "@/components/editor/cover-image-upload";
import { CategoryTagSelect } from "@/components/editor/category-tag-select";
import { AutoSaveStatus } from "@/components/editor/auto-save-status";
import { useAutoSave } from "@/hooks/use-auto-save";
import { calculateReadingTime, slugifyText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Eye, Save, Send, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { BlogPreviewModal } from "@/components/blog/blog-preview-modal";

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("DRAFT");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load blog or unauthorized");
        return res.json();
      })
      .then((data) => {
        const post = data.post;
        if (post) {
          setTitle(post.title || "");
          setContent(post.content || "");
          setExcerpt(post.excerpt || "");
          setCoverImage(post.coverImage || null);
          setCategoryId(post.categoryId || null);
          setTags(post.tags?.map((t: any) => t.tag.name) || []);
          setCurrentStatus(post.status);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load blog");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title.trim() || (content && content !== "<p></p>")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, content]);

  const handleAutoSave = useCallback(
    async (data: {
      title: string;
      content: string;
      excerpt: string;
      coverImage: string | null;
      categoryId: string | null;
      tags: string[];
    }) => {
      if (!data.title && !data.content) return;
      await fetch(`/api/blogs/${id}/auto-save`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    [id]
  );

  const { status: autoSaveStatus, lastSaved } = useAutoSave({
    data: { title, content, excerpt, coverImage, categoryId, tags },
    onSave: handleAutoSave,
    interval: 3000,
    enabled: currentStatus === "DRAFT",
  });

  const handleUpdate = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    setError(null);

    if (!title.trim()) {
      setError("Please provide a blog title");
      return;
    }

    if (targetStatus === "PUBLISHED" && (!content || content === "<p></p>")) {
      setError("Cannot publish an empty blog post");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage || undefined,
          categoryId: categoryId || undefined,
          tags,
          status: targetStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update blog post");
        setSaving(false);
        return;
      }

      router.push("/employee/blogs");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const readingTime = calculateReadingTime(content);
  const slugPreview = slugifyText(title);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/blogs"
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readingTime}
              </span>
              <span>•</span>
              <span className="font-semibold uppercase text-primary">{currentStatus}</span>
              {currentStatus === "DRAFT" && (
                <>
                  <span>•</span>
                  <AutoSaveStatus status={autoSaveStatus} lastSaved={lastSaved} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" /> Preview
          </Button>

          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={saving}
            onClick={() => handleUpdate("DRAFT")}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Draft
          </Button>

          <Button
            size="sm"
            type="button"
            disabled={saving}
            onClick={() => handleUpdate("PUBLISHED")}
            className="flex items-center gap-1.5 px-4"
          >
            <Send className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Blog Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
            autoFocus
          />
          {slugPreview && (
            <p className="text-xs text-muted-foreground mt-1">
              URL Slug: <span className="font-mono text-primary">/blogs/{slugPreview}</span>
            </p>
          )}
        </div>

        <CoverImageUpload value={coverImage} onChange={setCoverImage} />

        <CategoryTagSelect
          selectedCategory={categoryId}
          onSelectCategory={setCategoryId}
          selectedTags={tags}
          onSelectTags={setTags}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium" htmlFor="excerpt">
              Short Excerpt / Summary
            </label>
            <span className="text-xs text-muted-foreground">
              {excerpt.length} / 250 characters
            </span>
          </div>
          <Textarea
            id="excerpt"
            placeholder="A brief 1-2 sentence overview shown in blog cards and search results..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={250}
            rows={2}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Tip: A concise 120–160 character summary improves reading engagement and search snippets.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Blog Content <span className="text-red-500">*</span>
          </label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            placeholder="Write your story..."
          />
        </div>
      </div>

      <BlogPreviewModal
        blogId={id}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onPublishSuccess={() => router.push("/employee/blogs")}
      />
    </div>
  );
}
