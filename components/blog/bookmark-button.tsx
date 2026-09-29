"use client";

import { useBookmarks } from "@/hooks/use-bookmarks";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    category?: { name: string } | null;
    author?: { name: string } | null;
  };
  className?: string;
  size?: "sm" | "md";
}

export function BookmarkButton({ post, className = "", size = "sm" }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, mounted } = useBookmarks();

  if (!mounted) {
    return (
      <div className={`p-1.5 rounded-full text-muted-foreground/30 ${className}`}>
        <Bookmark className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </div>
    );
  }

  const bookmarked = isBookmarked(post.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = toggleBookmark(post);
    if (saved) {
      toast.success("Article saved for later reading");
    } else {
      toast.info("Article removed from saved list");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-1.5 rounded-full transition-colors active:scale-95 ${
        bookmarked
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      } ${className}`}
      title={bookmarked ? "Remove from saved articles" : "Save article for later"}
      aria-label={bookmarked ? "Saved article" : "Save article"}
    >
      <Bookmark
        className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} ${
          bookmarked ? "fill-primary" : ""
        }`}
      />
    </button>
  );
}
