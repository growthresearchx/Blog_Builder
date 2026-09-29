import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { blogSchema } from "@/lib/validations/blog";
import { calculateReadingTime, generateUniqueSlug } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (post.status !== PostStatus.PUBLISHED) {
      if (!session || (session.id !== post.authorId && session.role !== "ADMIN")) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this draft" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify another employee's blog post" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = blogSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid blog data" },
        { status: 400 }
      );
    }

    const { title, content, excerpt, coverImage, categoryId, tags, status } = validation.data;

    const readingTime = calculateReadingTime(content);

    let slug = existingPost.slug;
    if (title.trim() !== existingPost.title) {
      slug = await generateUniqueSlug(title, id);
    }

    let publishedAt = existingPost.publishedAt;
    if (status === PostStatus.PUBLISHED && !existingPost.publishedAt) {
      publishedAt = new Date();
    }

    const existingTags = tags && tags.length > 0
      ? await prisma.tag.findMany({
          where: {
            OR: [
              { id: { in: tags } },
              { name: { in: tags.map((t) => t.toLowerCase()) } },
            ],
          },
        })
      : [];

    await prisma.postTag.deleteMany({
      where: { postId: id },
    });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage || null,
        status,
        readingTime,
        publishedAt,
        categoryId: categoryId || null,
        tags: {
          create: existingTags.map((t) => ({
            tagId: t.id,
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}
