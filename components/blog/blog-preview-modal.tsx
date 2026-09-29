"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sanitizeHtml } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/category-utils";
import { Edit3, Send, Clock, Calendar, Eye, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BlogPreviewModalProps {
  blogId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: () => void;
}

export function BlogPreviewModal({
  blogId,
  isOpen,
  onClose,
  onPublishSuccess,
}: BlogPreviewModalProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isOpen && blogId) {
      setLoading(true);
      fetch(`/api/blogs/${blogId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Could not load preview");
          return res.json();
        })
        .then((data) => setPost(data.post))
        .catch(() => toast.error("Failed to load blog preview"))
        .finally(() => setLoading(false));
    } else {
      setPost(null);
    }
  }, [isOpen, blogId]);

  const handlePublish = async () => {
    if (!blogId) return;
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/blogs/${blogId}/publish`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Blog post published successfully!");
        onClose();
        if (onPublishSuccess) onPublishSuccess();
      } else {
        toast.error("Failed to publish blog");
      }
    } catch {
      toast.error("Network error while publishing");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  const categoryTheme = getCategoryTheme(post?.category?.name);
  const publishedDate = post?.publishedAt || post?.createdAt;
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner className="w-8 h-8 text-primary" />
          <p className="text-xs text-muted-foreground">Loading preview...</p>
        </div>
      ) : post ? (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
          {/* Header Preview Banner */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Live Article Preview ({post.status})</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/employee/blogs/edit/${post.id}`} onClick={onClose}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Edit3 className="h-3 w-3" /> Edit
                </Button>
              </Link>

              {post.status !== "PUBLISHED" && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="h-7 text-xs gap-1 shadow-xs"
                >
                  <Send className="h-3 w-3" />
                  {isPublishing ? "Publishing..." : "Publish"}
                </Button>
              )}
            </div>
          </div>

          {/* Article Main Preview Header */}
          <div className="space-y-3">
            {post.category && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryTheme.badgeClass}`}>
                {categoryTheme.icon}
                {post.category.name}
              </span>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {post.readingTime || "3 min read"}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border bg-muted">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          )}

          {/* HTML Body */}
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words pt-2"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </div>
      ) : null}
    </Modal>
  );
}
