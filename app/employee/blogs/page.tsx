"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit, Eye, BookOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPreviewModal } from "@/components/blog/blog-preview-modal";

export default function EmployeeBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "UNPUBLISHED">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewBlogId, setPreviewBlogId] = useState<string | null>(null);
  const pageSize = 8;

  const fetchBlogs = () => {
    setLoading(true);
    fetch("/api/blogs?mine=true")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load your blogs");
        return res.json();
      })
      .then((data) => setBlogs(data.blogs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    if (activeTab === "ALL") return true;
    return blog.status === activeTab;
  });

  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleTabChange = (tab: "ALL" | "DRAFT" | "PUBLISHED" | "UNPUBLISHED") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-800">
            Published
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Draft
          </span>
        );
      case "UNPUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Unpublished
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Blogs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your drafts, edit stories, and publish new articles.
          </p>
        </div>

        <Link href="/employee/blogs/create">
          <Button className="flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Create New Blog
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b space-x-6 text-sm font-medium overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "ALL", label: "All Posts" },
          { id: "PUBLISHED", label: "Published" },
          { id: "DRAFT", label: "Drafts" },
          { id: "UNPUBLISHED", label: "Unpublished" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`pb-3 relative transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}{" "}
            <span className="text-xs ml-1 px-1.5 py-0.5 rounded-full bg-muted">
              {tab.id === "ALL" ? blogs.length : blogs.filter((b) => b.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-red-50 text-red-600 dark:bg-red-950/50">{error}</div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16 border rounded-lg border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No blog posts found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {activeTab === "ALL"
              ? "You haven't written any blogs yet."
              : `You have no ${activeTab.toLowerCase()} blogs.`}
          </p>
          <Link href="/employee/blogs/create">
            <Button size="sm">Create Your First Blog</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reading Time</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{blog.title}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        /blogs/{blog.slug}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {blog.category?.name || "Uncategorized"}
                    </td>
                    <td className="p-4">{getStatusBadge(blog.status)}</td>
                    <td className="p-4 text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5" /> {blog.readingTime || "1 min read"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(blog.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewBlogId(blog.id)}
                          className="h-8 px-2.5 gap-1 text-xs"
                          title="Preview post in modal"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </Button>
                        <Link href={`/employee/blogs/edit/${blog.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs text-primary hover:text-primary"
                            title="Edit post"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredBlogs.length)} of {filteredBlogs.length} blogs
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-2 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Blog Preview Modal */}
      <BlogPreviewModal
        blogId={previewBlogId}
        isOpen={Boolean(previewBlogId)}
        onClose={() => setPreviewBlogId(null)}
        onPublishSuccess={fetchBlogs}
      />
    </div>
  );
}
