"use client";

import { useEffect, useState } from "react";
import { CategoryManager, CategoryItem } from "@/components/admin/category-manager";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { FolderTree, RefreshCw } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/categories", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Create, update, and manage primary topics for articles across the platform.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCategories}
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
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchCategories} className="mt-4" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : (
        <CategoryManager
          categories={categories}
          onRefresh={fetchCategories}
        />
      )}
    </div>
  );
}
