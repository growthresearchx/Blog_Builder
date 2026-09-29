import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BlogList } from "@/components/blog/blog-list";
import { BlogFilter } from "@/components/blog/blog-filter";
import { PaginationClientWrapper } from "@/components/blog/pagination-client-wrapper";
import { PostStatus } from "@prisma/client";
import { FolderTree, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import type { PostItem } from "@/types";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });

  if (!category) {
    return { title: "Category Not Found | BlogBuilder" };
  }

  return {
    title: `${category.name} Articles | BlogBuilder`,
    description: `Read all articles in category ${category.name}`,
  };
}

export default async function CategoryFilterPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const limit = 6;
  const skip = (page - 1) * limit;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const [allCategories, allTags] = await Promise.all([
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

  const where = {
    categoryId: category.id,
    status: PostStatus.PUBLISHED,
  };

  const [blogs, total] = await Promise.all([
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
      <div className="space-y-4 border-b pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Categories</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <FolderTree className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {total} {total === 1 ? "article" : "articles"} in this category
            </p>
          </div>
        </div>

        <div className="pt-2">
          <BlogFilter
            categories={allCategories}
            tags={allTags}
            activeCategorySlug={slug}
          />
        </div>
      </div>

      <BlogList
        posts={formattedBlogs}
        emptyMessage={`No published articles currently found in "${category.name}".`}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <PaginationClientWrapper
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/category/${slug}`}
          />
        </div>
      )}
    </div>
  );
}
