"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/utils";
import { Edit3, Send, Clock, Calendar, ShieldAlert } from "lucide-react";

export default function EmployeeBlogPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load preview or forbidden");
        return res.json();
      })
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message || "Failed to load preview"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/blogs/${id}/publish`, { method: "PATCH" });
      if (res.ok) {
        router.push("/employee/blogs");
        router.refresh();
      }
    } catch (err) {
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 border rounded-lg text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Preview Unavailable</h2>
        <p className="text-sm text-muted-foreground">
          {error || "You do not have permission to preview this blog post."}
        </p>
        <Link href="/employee/blogs">
          <Button variant="outline">Back to My Blogs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-20">
      {/* Top Banner indicating Private Preview */}
      <div className="sticky top-4 z-30 bg-amber-50/95 dark:bg-amber-950/80 backdrop-blur border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
          <span className="font-bold uppercase tracking-wide text-xs px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shadow-xs">
            {post.status} Preview
          </span>
          <span className="text-xs sm:text-sm">Only you can see this preview.</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/employee/blogs/edit/${post.id}`}>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
          {post.status !== "PUBLISHED" && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? "Publishing..." : "Publish Now"}
            </Button>
          )}
        </div>
      </div>

      {/* Blog Header */}
      <header className="space-y-4">
        {post.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary">
            {post.category.name}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight break-words">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed break-words">
            {post.excerpt}
          </p>
        )}

        {/* Author metadata */}
        <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground border-y py-3">
          {post.author?.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              {post.author?.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{post.author?.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTime || "3 min read"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted shadow-sm">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Formatted Content with Sanitization */}
      <div
        className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed pt-2 break-words prose-pre:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t flex flex-wrap gap-2">
          {post.tags.map((t: any) => (
            <span
              key={t.tag.id || t.tag.name}
              className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
            >
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
