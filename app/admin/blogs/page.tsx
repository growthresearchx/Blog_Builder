"use client";

import { useEffect, useState } from "react";
import { AdminBlogTable } from "@/components/admin/admin-blog-table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { PostItem } from "@/types";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/blogs", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch platform blogs");
      }
      setBlogs(data.blogs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load blogs");
      toast.error(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleRequestUnpublish = (id: string, title: string) => {
    setUnpublishTarget({ id, title });
  };

  const handleConfirmUnpublish = async () => {
    if (!unpublishTarget) return;

    const { id, title } = unpublishTarget;
    setUnpublishingId(id);
    try {
      const res = await fetch(`/api/blogs/${id}/unpublish`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unpublish blog post");
      }

      toast.success(data.message || `Blog "${title}" unpublished`);
      setUnpublishTarget(null);
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to unpublish blog");
    } finally {
      setUnpublishingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Platform Blogs</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {blogs.length} Total
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage, edit, or unpublish any blog post across the platform.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBlogs}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading platform blogs...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchBlogs} className="mt-4" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : (
        <AdminBlogTable
          blogs={blogs}
          onUnpublish={handleRequestUnpublish}
          isUnpublishingId={unpublishingId}
        />
      )}

      {/* Unpublish Confirmation Modal */}
      <Modal
        isOpen={!!unpublishTarget}
        onClose={() => setUnpublishTarget(null)}
        title="Unpublish Blog Post"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Are you sure you want to unpublish &quot;{unpublishTarget?.title}&quot;?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                It will be converted to Unpublished status and will no longer be visible to public readers.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUnpublishTarget(null)}
              disabled={!!unpublishingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmUnpublish}
              disabled={!!unpublishingId}
            >
              {unpublishingId ? "Unpublishing..." : "Unpublish Blog"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
