import { BlogCard } from "./blog-card";
import type { PostItem } from "@/types";
import { BookOpen } from "lucide-react";

interface BlogListProps {
  posts: PostItem[];
  emptyMessage?: string;
}

export function BlogList({ posts, emptyMessage = "No published articles found." }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="border rounded-2xl p-12 text-center bg-card shadow-sm my-8 animate-fade-in">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">No Articles Yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
