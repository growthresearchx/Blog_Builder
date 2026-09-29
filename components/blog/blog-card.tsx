"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PostItem } from "@/types";
import { Clock, Calendar, Eye, Heart, MessageSquare, User } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-utils";
import { BookmarkButton } from "./bookmark-button";

interface BlogCardProps {
  post: PostItem;
}

export function BlogCard({ post }: BlogCardProps) {
  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryTheme = getCategoryTheme(post.category?.name);

  return (
    <Card className="group overflow-hidden flex flex-col justify-between border bg-card hover:shadow-lg dark:hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 rounded-xl h-full">
      <div>
        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Link href={`/blogs/${post.slug}`} prefetch={true} className="block w-full h-full">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${categoryTheme.gradientClass} text-muted-foreground p-6 text-center group-hover:scale-102 transition-transform duration-300`}>
                <div className="h-12 w-12 rounded-2xl bg-background/90 border shadow-xs flex items-center justify-center text-primary mb-2">
                  {categoryTheme.icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
                  {post.category?.name || "Article"}
                </span>
              </div>
            )}
          </Link>

          {post.category && (
            <div className="absolute top-3 left-3 z-10">
              <Link
                href={`/category/${post.category.slug}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur shadow-xs border ${categoryTheme.badgeClass} bg-background/90 hover:bg-background transition`}
              >
                {categoryTheme.icon}
                <span>{post.category.name}</span>
              </Link>
            </div>
          )}

          <div className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur rounded-full shadow-xs border">
            <BookmarkButton post={post} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {/* Metadata Bar (Date & Reading Time) */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime || "3 min read"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold tracking-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem] flex items-start">
            <Link href={`/blogs/${post.slug}`} className="focus-visible:underline focus-visible:outline-none">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {post.excerpt || "Read this article on BlogBuilder."}
          </p>

          {/* Tags Pills */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 3).map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-medium text-muted-foreground hover:text-primary bg-muted/60 hover:bg-muted px-2 py-0.5 rounded transition"
                >
                  #{tag.name}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="text-[11px] text-muted-foreground self-center">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Author Info & Metrics */}
      <div className="px-5 py-4 border-t bg-muted/20 flex items-center justify-between text-xs">
        {/* Author */}
        <div className="flex items-center gap-2.5">
          {post.author ? (
            <>
              {post.author.avatar ? (
                <div className="relative w-7 h-7 rounded-full overflow-hidden border">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-foreground truncate max-w-[120px]">
                {post.author.name}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground italic flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Staff Writer
            </span>
          )}
        </div>

        {/* View / Likes Counts */}
        <div className="flex items-center gap-3 text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1" title="Total views">
            <Eye className="h-3.5 w-3.5" />
            {post.viewCount || 0}
          </span>
          {post._count && (
            <>
              <span className="inline-flex items-center gap-1" title="Likes">
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes}
              </span>
              <span className="inline-flex items-center gap-1" title="Comments">
                <MessageSquare className="h-3.5 w-3.5" />
                {post._count.comments}
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
