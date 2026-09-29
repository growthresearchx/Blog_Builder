"use client";

import { useEffect, useState } from "react";
import { TagManager, TagItem } from "@/components/admin/tag-manager";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Tag, RefreshCw } from "lucide-react";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tags", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tags");
      }
      setTags(data.tags || []);
    } catch (err: any) {
      setError(err.message || "Failed to load tags");
      toast.error(err.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {tags.length} Tags
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, update, and manage global tags available to employees during blog authoring.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTags}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading tags...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchTags} className="mt-4" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : (
        <TagManager
          tags={tags}
          onRefresh={fetchTags}
        />
      )}
    </div>
  );
}
