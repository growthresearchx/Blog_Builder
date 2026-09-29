"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialLikes?: number;
}

export function LikeButton({ postId, initialLikes = 0 }: LikeButtonProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${postId}/likes`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          setLikes(data.likes);
          setHasLiked(data.hasLiked);
        }
      })
      .catch(() => {});
  }, [postId]);

  const handleToggleLike = async () => {
    if (loading) return;

    // Optimistic state updates
    const previousHasLiked = hasLiked;
    const previousLikes = likes;
    const nextHasLiked = !hasLiked;
    const nextLikes = nextHasLiked ? likes + 1 : Math.max(0, likes - 1);

    setHasLiked(nextHasLiked);
    setLikes(nextLikes);
    setLoading(true);

    try {
      const res = await fetch(`/api/blogs/${postId}/likes`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 401) {
        // Revert optimistic update
        setHasLiked(previousHasLiked);
        setLikes(previousLikes);
        toast.error("Please sign in to like this blog post");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to update like");
      }

      setLikes(data.likes);
      setHasLiked(data.hasLiked);
      if (data.hasLiked) {
        toast.success("Added to your liked posts!");
      }
    } catch (err: any) {
      // Revert optimistic state
      setHasLiked(previousHasLiked);
      setLikes(previousLikes);
      toast.error(err.message || "Failed to like post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95 duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        hasLiked
          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shadow-sm"
          : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted border-border"
      }`}
      aria-label={hasLiked ? "Unlike post" : "Like post"}
    >
      <Heart
        className={`h-4 w-4 transition-transform duration-200 ${
          hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
        } ${loading ? "animate-pulse" : ""}`}
      />
      <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
    </button>
  );
}
