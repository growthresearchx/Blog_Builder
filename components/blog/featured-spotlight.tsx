"use client";

import Link from "next/link";
import Image from "next/image";
import type { PostItem } from "@/types";
import { getCategoryTheme } from "@/lib/category-utils";
import { Calendar, Clock, Eye, Sparkles, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedSpotlightProps {
  post: PostItem;
}

export function FeaturedSpotlight({ post }: FeaturedSpotlightProps) {
  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryTheme = getCategoryTheme(post.category?.name);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 lg:p-10">
      {/* Background Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Story Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Story
            </span>

            {post.category && (
              <Link
                href={`/category/${post.category.slug}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryTheme.badgeClass} hover:opacity-80 transition-opacity`}
              >
                {categoryTheme.icon}
                <span>{post.category.name}</span>
              </Link>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            <Link
              href={`/blogs/${post.slug}`}
              className="hover:text-primary transition-colors focus-visible:underline focus-visible:outline-none"
            >
              {post.title}
            </Link>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
            {post.excerpt || "Explore this featured story on the Analyticsliv BlogBuilder platform."}
          </p>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60">
            <div className="flex items-center gap-3">
              {post.author ? (
                <>
                  {post.author.avatar ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-foreground">{post.author.name}</div>
                    <div className="text-xs text-muted-foreground">{formattedDate}</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                  <User className="h-4 w-4" />
                  Staff Writer
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime || "3 min read"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount || 0} views
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href={`/blogs/${post.slug}`} prefetch={true}>
              <Button className="gap-2 shadow-md hover:shadow-lg font-semibold text-sm">
                <span>Read Full Article</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Cover Image Visual */}
        <div className="lg:col-span-5">
          <Link href={`/blogs/${post.slug}`} prefetch={true} className="block group">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border bg-muted shadow-md group-hover:shadow-lg transition-all duration-300">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${categoryTheme.gradientClass} p-8 text-center`}>
                  <div className="h-16 w-16 rounded-2xl bg-background/90 border shadow-md flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                    {categoryTheme.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {post.category?.name || "Featured Article"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
