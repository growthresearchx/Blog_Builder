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

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Admin has privileges to unpublish blog posts" },
        { status: 403 }
      );
    }

    const { id } = params;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.UNPUBLISHED,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog post unpublished by Admin",
      post: updated,
    });
  } catch (error) {
    console.error("Unpublish error:", error);
    return NextResponse.json({ error: "Failed to unpublish blog post" }, { status: 500 });
  }
}
