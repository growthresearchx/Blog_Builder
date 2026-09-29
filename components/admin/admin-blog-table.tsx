"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostItem } from "@/types";
import {
  FileText,
  Eye,
  Edit2,
  EyeOff,
  User,
  Calendar,
  FolderTree,
} from "lucide-react";

interface AdminBlogTableProps {
  blogs: PostItem[];
  onUnpublish: (id: string, title: string) => void;
  isUnpublishingId?: string | null;
}

export function AdminBlogTable({
  blogs,
  onUnpublish,
  isUnpublishingId,
}: AdminBlogTableProps) {
  if (blogs.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center bg-card shadow-sm">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium">No Blogs Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          There are currently no blog posts on the platform.
        </p>
      </div>
    );
  }

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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg bg-card shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase border-b">
          <tr>
            <th className="px-6 py-4">Title & Category</th>
            <th className="px-6 py-4">Author</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Views</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {blogs.map((blog) => {
            const isUnpublishing = isUnpublishingId === blog.id;
            return (
              <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 max-w-sm">
                  <div className="font-semibold text-foreground line-clamp-1" title={blog.title}>
                    {blog.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {blog.category ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <FolderTree className="h-3 w-3" />
                        {blog.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">
                        Uncategorized
                      </span>
                    )}
                    {blog.tags && blog.tags.length > 0 && (
                      <span className="text-xs text-muted-foreground/60">
                        • {blog.tags.length} {blog.tags.length === 1 ? "tag" : "tags"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {blog.author ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {blog.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          {blog.author.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {blog.author.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground italic">
                      <User className="h-3.5 w-3.5" />
                      Former Employee
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{getStatusBadge(blog.status)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 font-semibold text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {blog.viewCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Link href={`/admin/blogs/edit/${blog.id}`}>
                    <Button variant="outline" size="sm" className="h-8 px-2.5">
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  {blog.status === "PUBLISHED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUnpublishing}
                      onClick={() => onUnpublish(blog.id, blog.title)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-200 dark:border-amber-800 h-8 px-2.5"
                      title="Unpublish post"
                    >
                      <EyeOff className="h-3.5 w-3.5 mr-1" />
                      {isUnpublishing ? "Unpublishing..." : "Unpublish"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
