import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogDetail } from "@/components/blog/blog-detail";
import { PostStatus } from "@prisma/client";
import type { Metadata } from "next";
import type { PostItem } from "@/types";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true },
  });

  if (!post) {
    return {
      title: "Blog Not Found | BlogBuilder",
    };
  }

  return {
    title: `${post.title} | BlogBuilder`,
    description: post.excerpt || "Read this article on BlogBuilder",
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = params;

  const post = await prisma.post.findUnique({
    where: { slug },
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
  });

  if (!post || post.status !== PostStatus.PUBLISHED) {
    notFound();
  }

  const formattedPost: PostItem = {
    ...post,
    status: post.status as any,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  };

  return <BlogDetail post={formattedPost} />;
}
