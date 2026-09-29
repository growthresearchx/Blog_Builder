import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { autoSaveSchema } from "@/lib/validations/blog";
import { calculateReadingTime, generateUniqueSlug } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = autoSaveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid auto-save payload" }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, categoryId, tags } = validation.data;
    const postTitle = title?.trim() || "Untitled Draft";
    const postContent = content || "";
    const slug = await generateUniqueSlug(postTitle);
    const readingTime = calculateReadingTime(postContent);

    const post = await prisma.post.create({
      data: {
        title: postTitle,
        slug,
        content: postContent,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        status: PostStatus.DRAFT,
        readingTime,
        authorId: session.id,
        categoryId: categoryId || null,
        tags: {
          create: (tags || []).map((tagIdOrName) => ({
            tag: {
              connectOrCreate: {
                where: { id: tagIdOrName },
                create: {
                  name: tagIdOrName,
                  slug: tagIdOrName.toLowerCase().replace(/\s+/g, "-"),
                },
              },
            },
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Initial draft created",
      postId: post.id,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error("Initial auto-save error:", error);
    return NextResponse.json({ error: "Failed to create initial draft" }, { status: 500 });
  }
}
