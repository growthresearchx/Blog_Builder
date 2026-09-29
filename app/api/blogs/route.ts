import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { blogSchema } from "@/lib/validations/blog";
import { calculateReadingTime, generateUniqueSlug } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const { searchParams } = new URL(req.url);

    const mine = searchParams.get("mine") === "true";
    const status = searchParams.get("status") as PostStatus | null;
    const categoryId = searchParams.get("categoryId");
    const categorySlug = searchParams.get("categorySlug");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search") || searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "9", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (mine) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.authorId = session.id;
    } else {
      if (!session || session.role !== "ADMIN") {
        where.status = PostStatus.PUBLISHED;
      }
    }

    if (status && Object.values(PostStatus).includes(status)) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

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

    return NextResponse.json({
      success: true,
      blogs,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Fetch blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const slug = await generateUniqueSlug(title);
    const readingTime = calculateReadingTime(content);
    const isPublishing = status === PostStatus.PUBLISHED;
    const publishedAt = isPublishing ? new Date() : null;

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

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage || null,
        status,
        readingTime,
        publishedAt,
        authorId: session.id,
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

    return NextResponse.json(
      {
        success: true,
        message: isPublishing ? "Blog published successfully" : "Draft saved successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
