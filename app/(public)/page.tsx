import { prisma } from "@/lib/prisma";
import { BlogList } from "@/components/blog/blog-list";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogFilter } from "@/components/blog/blog-filter";
import { Pagination } from "@/components/ui/pagination";
import { PostStatus } from "@prisma/client";
import type { PostItem } from "@/types";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: {
    page?: string;
  };
}

import { FeaturedSpotlight } from "@/components/blog/featured-spotlight";
import { PaginationClientWrapper as PaginationControls } from "@/components/blog/pagination-client-wrapper";

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const limit = 6;
  const skip = (page - 1) * limit;

  const [blogs, total, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      skip,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    prisma.post.count({
      where: { status: PostStatus.PUBLISHED },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.tag.findMany({
      take: 10,
      orderBy: { posts: { _count: "desc" } },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const formattedBlogs: PostItem[] = blogs.map((b) => ({
    ...b,
    status: b.status as any,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
  }));

  const featuredPost = page === 1 && formattedBlogs.length > 0 ? formattedBlogs[0] : null;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Intro Header */}
      <section className="text-center py-10 md:py-14 space-y-6 border-b">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-fade-in-up">
            Analyticsliv Engineering & Technology Publication
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] animate-fade-in-up [animation-delay:100ms]">
            Explore Engineering & Data Insights
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in-up [animation-delay:200ms] max-w-2xl mx-auto">
            Discover in-depth articles, tutorials, and architectural insights authored by developers and engineers.
          </p>
        </div>

        <div className="pt-2 animate-fade-in-up [animation-delay:300ms]">
          <BlogSearch />
        </div>
      </section>

      {/* Featured Spotlight Card on Page 1 */}
      {featuredPost && (
        <section className="animate-fade-in-up">
          <FeaturedSpotlight post={featuredPost} />
        </section>
      )}

      {/* Main Articles Stream & Filter Bar */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <BlogFilter
            categories={categories}
            tags={tags}
          />
          <div className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Showing {blogs.length} of {total} articles
          </div>
        </div>

        <BlogList
          posts={formattedBlogs}
          emptyMessage="No published articles yet. Check back soon for new insights!"
        />

        {totalPages > 1 && (
          <div className="flex justify-center pt-6">
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/"
            />
          </div>
        )}
      </section>
    </div>
  );
}
