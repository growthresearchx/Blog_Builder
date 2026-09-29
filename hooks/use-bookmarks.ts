"use client";

import { useState, useEffect } from "react";
import type { PostItem } from "@/types";

const BOOKMARKS_KEY = "blogbuilder_saved_articles";

export interface BookmarkedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  categoryName?: string | null;
  authorName?: string | null;
  savedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch {
      setBookmarks([]);
    } finally {
      setMounted(true);
    }
  }, []);

  const saveBookmarks = (items: BookmarkedArticle[]) => {
    setBookmarks(items);
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(items));
    } catch {}
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    category?: { name: string } | null;
    author?: { name: string } | null;
  }) => {
    if (isBookmarked(post.id)) {
      const updated = bookmarks.filter((b) => b.id !== post.id);
      saveBookmarks(updated);
      return false;
    } else {
      const newBookmark: BookmarkedArticle = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        categoryName: post.category?.name,
        authorName: post.author?.name,
        savedAt: new Date().toISOString(),
      };
      const updated = [newBookmark, ...bookmarks];
      saveBookmarks(updated);
      return true;
    }
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarks(updated);
  };

  const clearAllBookmarks = () => {
    saveBookmarks([]);
  };

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    mounted,
  };
}
