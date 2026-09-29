"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { CoverImageUpload } from "@/components/editor/cover-image-upload";
import { CategoryTagSelect } from "@/components/editor/category-tag-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminEditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "UNPUBLISHED">("PUBLISHED");
  const [authorInfo, setAuthorInfo] = useState<{ name: string; email: string } | null>(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/blogs/${id}`, { credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch blog post");
      }

      const post = data.post;
      setTitle(post.title || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCoverImage(post.coverImage || null);
      setCategoryId(post.categoryId || null);
      setTags(post.tags?.map((t: any) => t.tag.name) || []);
      setStatus(post.status || "PUBLISHED");
      if (post.author) {
        setAuthorInfo({ name: post.author.name, email: post.author.email });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blog");
      toast.error(err.message || "Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Blog content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content,
          coverImage,
          categoryId,
          tags,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update blog post");
      }

      toast.success("Blog updated successfully by Admin");
      router.push("/admin/blogs");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading blog post for editing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-destructive">Error Loading Blog</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <Link href="/admin/blogs">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Platform Blogs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link href="/admin/blogs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Admin Changes"}
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-muted/40 border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {authorInfo ? authorInfo.name.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <div className="text-sm font-semibold">
              Author: {authorInfo ? authorInfo.name : "Former Employee"}
            </div>
            <div className="text-xs text-muted-foreground">
              {authorInfo ? authorInfo.email : "Author account was removed (posts preserved)"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="UNPUBLISHED">UNPUBLISHED</option>
          </select>
        </div>
      </Card>

      <div className="space-y-6">
        <CoverImageUpload
          value={coverImage}
          onChange={(url) => setCoverImage(url)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Blog Title</label>
          <Input
            placeholder="Enter blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="admin-excerpt">Excerpt (Summary)</label>
            <span className="text-xs text-muted-foreground">
              {excerpt.length} / 250 characters
            </span>
          </div>
          <Textarea
            id="admin-excerpt"
            placeholder="Short summary for preview cards and search results..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={250}
            rows={2}
          />
        </div>

        <Card className="p-4 border bg-card">
          <CategoryTagSelect
            selectedCategory={categoryId}
            onSelectCategory={setCategoryId}
            selectedTags={tags}
            onSelectTags={setTags}
          />
        </Card>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Blog Content</label>
          <TipTapEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Admin Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
