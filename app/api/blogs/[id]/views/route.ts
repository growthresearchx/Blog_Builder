import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, status: true, viewCount: true },
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Post not found or not published" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.postView.create({
        data: {
          postId: id,
        },
      }),
      prisma.post.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "View recorded successfully",
      viewCount: post.viewCount + 1,
    });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
