import { prisma } from "@/lib/prisma";
import { BlogList } from "@/components/blog/blog-list";
import { BlogSearch } from "@/components/blog/blog-search";
import { PaginationClientWrapper } from "@/components/blog/pagination-client-wrapper";
import { PostStatus } from "@prisma/client";
import { Search as SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import type { PostItem } from "@/types";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams?: {
    q?: string;
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchParams?.q?.trim();
  if (q) {
    return { title: `Search results for "${q}" | BlogBuilder` };
  }
  return { title: "Search Articles | BlogBuilder" };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q?.trim() || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const limit = 6;
  const skip = (page - 1) * limit;

  let blogs: any[] = [];
  let total = 0;

  if (query) {
    const where = {
      status: PostStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { excerpt: { contains: query, mode: "insensitive" as const } },
        { content: { contains: query, mode: "insensitive" as const } },
      ],
    };

    [blogs, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
      prisma.post.count({ where }),
    ]);
  }

  const totalPages = Math.ceil(total / limit);

  const formattedBlogs: PostItem[] = blogs.map((b) => ({
    ...b,
    status: b.status as any,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Search Header */}
      <div className="text-center py-8 space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {query ? (
            <>
              Search Results for <span className="text-primary">&quot;{query}&quot;</span>
            </>
          ) : (
            "Search Platform Articles"
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          {query
            ? `Found ${total} ${total === 1 ? "article" : "articles"} matching your query`
            : "Search published articles across titles, excerpts, and full text content."}
        </p>

        <div className="pt-2">
          <BlogSearch />
        </div>
      </div>

      {/* Results Content */}
      {query ? (
        <div className="space-y-8">
          <BlogList
            posts={formattedBlogs}
            emptyMessage={`No published articles found matching "${query}". Try searching with different keywords.`}
          />

          {totalPages > 1 && (
            <div className="flex justify-center pt-6">
              <PaginationClientWrapper
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/search"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed rounded-2xl p-12 text-center bg-card shadow-sm max-w-xl mx-auto space-y-3 animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <SearchIcon className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-base text-foreground">Ready to Search</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Type keywords into the search box above to discover insights, tutorials, and engineering articles.
          </p>
        </div>
      )}
    </div>
  );
}
