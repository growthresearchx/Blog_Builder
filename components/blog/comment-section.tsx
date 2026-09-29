"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Send, LogIn, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/blogs/${postId}/comments`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => setCurrentUser(null));

    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please sign in to post a comment");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to post comment");
      }

      toast.success("Comment posted!");
      setNewComment("");
      setComments((prev) => [data.comment, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    setDeletingId(commentToDelete);
    try {
      const res = await fetch(`/api/comments/${commentToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete comment");
      }

      toast.success("Comment deleted");
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      setCommentToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t space-y-8" id="comments">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span>Discussion ({comments.length})</span>
        </h3>
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-3 bg-muted/20 p-5 rounded-xl border">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>Commenting as <strong className="text-foreground">{currentUser.name}</strong></span>
          </div>
          <Textarea
            placeholder="Share your constructive thoughts, questions, or insights..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            maxLength={2000}
            rows={3}
            className="resize-none bg-background"
            required
          />
          <div className="flex items-center justify-between pt-1">
            <span
              className={cn(
                "text-[11px] font-medium transition-colors",
                newComment.length >= 2000
                  ? "text-destructive font-bold"
                  : newComment.length >= 1800
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              {newComment.length}/2000 characters
            </span>
            <Button
              type="submit"
              disabled={submitting || !newComment.trim()}
              size="sm"
              className="gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 border rounded-xl bg-muted/30 text-center space-y-3">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            Sign in to join the conversation and share your feedback.
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign in to Comment
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
            No comments yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = currentUser?.id === comment.user.id;
            const isAdmin = currentUser?.role === "ADMIN";
            const canDelete = isAuthor || isAdmin;
            const isDeleting = deletingId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-5 border rounded-xl bg-card space-y-3 shadow-sm transition-colors animate-fade-in-down"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {comment.user.avatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border">
                        <Image
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {comment.user.name}
                        </span>
                        {comment.user.role === "ADMIN" && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => setCommentToDelete(comment.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pl-11">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* In-App Delete Confirmation Modal */}
      <Modal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        title="Delete Comment"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Are you sure you want to permanently delete this comment?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommentToDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting..." : "Delete Comment"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
