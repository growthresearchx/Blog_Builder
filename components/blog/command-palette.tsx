"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderTree, Tag, ArrowRight, CornerDownLeft, Sparkles, X } from "lucide-react";
import type { PostItem } from "@/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.categories?.slice(0, 5) || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/blogs?status=PUBLISHED&search=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.blogs?.slice(0, 5) || []);
          setSelectedIndex(0);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectPost = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/blogs/${slug}`);
    },
    [onClose, router]
  );

  const handleSelectCategory = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/category/${slug}`);
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelectPost(selected.slug);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, handleSelectPost]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="w-full max-w-2xl bg-card border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b gap-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search articles, topics, or categories... (Press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-muted-foreground bg-muted border rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Searching articles...
            </div>
          ) : query && results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Articles ({results.length})
              </div>
              {results.map((post, idx) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => handleSelectPost(post.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    selectedIndex === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`h-4 w-4 shrink-0 ${selectedIndex === idx ? "text-primary-foreground" : "text-primary"}`} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{post.title}</div>
                      <div className={`text-xs truncate ${selectedIndex === idx ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {post.category?.name || "Uncategorized"} • {post.readingTime || "3 min read"}
                      </div>
                    </div>
                  </div>
                  <CornerDownLeft className={`h-3.5 w-3.5 shrink-0 opacity-70 ${selectedIndex === idx ? "block" : "hidden sm:block"}`} />
                </button>
              ))}
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching articles found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {categories.length > 0 && (
                <div>
                  <div className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Browse Popular Categories
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.slug)}
                        className="px-3 py-2 rounded-lg border bg-background hover:bg-muted text-xs font-medium flex items-center gap-2 transition-colors text-left"
                      >
                        <FolderTree className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <div className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Actions
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push("/employee/blogs/create");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border bg-background hover:bg-muted text-xs font-medium flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Write a New Blog Post
                    </span>
                    <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">New</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push("/search");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border bg-background hover:bg-muted text-xs font-medium flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-primary" />
                      Advanced Article Search
                    </span>
                    <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Search</kbd>
                  </button>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Spotlight Command Search
                </span>
                <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to select</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
