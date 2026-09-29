import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { autoSaveSchema } from "@/lib/validations/blog";
import { calculateReadingTime, generateUniqueSlug } from "@/lib/utils";
import { PostStatus } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Cannot auto-save another employee's post" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = autoSaveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid auto-save payload" }, { status: 400 });
    }

    const { title, content, excerpt, coverImage, categoryId, tags } = validation.data;

    const dataToUpdate: any = {};
    if (title !== undefined && title.trim()) {
      dataToUpdate.title = title.trim();
      if (title.trim() !== existingPost.title) {
        dataToUpdate.slug = await generateUniqueSlug(title, id);
      }
    }
    if (content !== undefined) {
      dataToUpdate.content = content;
      dataToUpdate.readingTime = calculateReadingTime(content);
    }
    if (excerpt !== undefined) dataToUpdate.excerpt = excerpt;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;

    if (existingPost.status !== PostStatus.PUBLISHED) {
      dataToUpdate.status = PostStatus.DRAFT;
    }

    if (tags !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      dataToUpdate.tags = {
        create: tags.map((tagIdOrName) => ({
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
      };
    }

    const updated = await prisma.post.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Draft auto-saved",
      postId: updated.id,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json({ error: "Auto-save failed" }, { status: 500 });
  }
}
