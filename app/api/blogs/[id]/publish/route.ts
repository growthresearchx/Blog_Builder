import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
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
        { error: "Forbidden: You cannot publish another employee's blog post" },
        { status: 403 }
      );
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: existingPost.publishedAt || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog post published successfully",
      post: updated,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Failed to publish blog post" }, { status: 500 });
  }
}
