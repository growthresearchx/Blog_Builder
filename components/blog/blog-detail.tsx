"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LikeButton } from "./like-button";
import { CommentSection } from "./comment-section";
import { TableOfContents } from "./table-of-contents";
import { SocialShare } from "./social-share";
import { BackToTop } from "./back-to-top";
import { ArticleAudioPlayer } from "./article-audio-player";
import { CodeCopyHandler } from "./code-copy-handler";
import { sanitizeHtml } from "@/lib/utils";
import { getCategoryTheme } from "@/lib/category-utils";
import type { PostItem } from "@/types";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag as TagIcon,
  Eye,
  User,
} from "lucide-react";

interface BlogDetailProps {
  post: PostItem;
}

export function BlogDetail({ post }: BlogDetailProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (post.id && post.status === "PUBLISHED") {
      fetch(`/api/blogs/${post.id}/views`, {
        method: "POST",
      }).catch(() => {});
    }
  }, [post.id, post.status]);

  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const categoryTheme = getCategoryTheme(post.category?.name);

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Body */}
        <article className="lg:col-span-8 space-y-8 animate-fade-in-up">
          {/* Top Bar with Navigation & Sharing */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Articles</span>
            </Link>

            <div className="flex items-center gap-2">
              {post.category && (
                <Link
                  href={`/category/${post.category.slug}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryTheme.badgeClass} hover:opacity-80 transition-opacity`}
                >
                  {categoryTheme.icon}
                  <span>{post.category.name}</span>
                </Link>
              )}
              <SocialShare title={post.title} />
            </div>
          </div>

          <header className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] break-words">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed break-words">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y text-sm">
              <div className="flex items-center gap-3">
                {post.author ? (
                  <>
                    {post.author.avatar ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border flex-shrink-0">
                        <Image
                          src={post.author.avatar}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-foreground">{post.author.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {post.author.email}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground italic">
                    <User className="h-5 w-5" />
                    <span>Former Employee</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime || "4 min read"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {post.viewCount || 0} views
                </span>
              </div>
            </div>
          </header>

          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border bg-muted shadow-md">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          <ArticleAudioPlayer title={post.title} content={post.content} />
          <CodeCopyHandler />

          <div
            className="prose prose-lg dark:prose-invert max-w-none break-words prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-muted/90 prose-pre:border prose-pre:rounded-xl prose-pre:overflow-x-auto prose-code:text-primary prose-blockquote:border-l-primary prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t flex items-center flex-wrap gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <TagIcon className="h-3.5 w-3.5" />
                Tags:
              </span>
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          <div className="p-4 bg-muted/30 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LikeButton postId={post.id} initialLikes={post._count?.likes || 0} />
              <a
                href="#comments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
              >
                <span>💬 Join Discussion ({post._count?.comments || 0})</span>
              </a>
            </div>
            <SocialShare title={post.title} />
          </div>

          <CommentSection postId={post.id} />
        </article>

        {/* Right Sticky Sidebar (Desktop TOC) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <TableOfContents content={post.content} />
        </aside>
      </div>

      <BackToTop />
    </>
  );
}
