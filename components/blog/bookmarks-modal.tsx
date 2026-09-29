"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Bookmark, Trash2, ArrowRight, BookOpen } from "lucide-react";

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarksModal({ isOpen, onClose }: BookmarksModalProps) {
  const { bookmarks, removeBookmark, clearAllBookmarks, mounted } = useBookmarks();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saved Articles for Later">
      <div className="space-y-4 max-h-[70vh] flex flex-col">
        {bookmarks.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
            <span>{bookmarks.length} {bookmarks.length === 1 ? "article" : "articles"} saved offline</span>
            <button
              type="button"
              onClick={clearAllBookmarks}
              className="text-destructive hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {!mounted || bookmarks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Bookmark className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No saved articles yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Click the bookmark icon on any article card or story detail to save it for reading later.
              </p>
            </div>
          ) : (
            bookmarks.map((article) => (
              <div
                key={article.id}
                className="p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors flex items-start justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  {article.categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {article.categoryName}
                    </span>
                  )}
                  <h4 className="font-semibold text-sm line-clamp-1">
                    <Link
                      href={`/blogs/${article.slug}`}
                      onClick={onClose}
                      className="hover:text-primary transition-colors focus-visible:underline focus-visible:outline-none"
                    >
                      {article.title}
                    </Link>
                  </h4>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <Link href={`/blogs/${article.slug}`} onClick={onClose}>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeBookmark(article.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                    title="Remove from saved"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
