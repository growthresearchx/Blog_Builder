import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getAuthSession(req);

    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Post not found or not published" },
        { status: 404 }
      );
    }

    let hasLiked = false;
    if (session?.id) {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: session.id,
          },
        },
      });
      hasLiked = !!existingLike;
    }

    return NextResponse.json({
      success: true,
      likes: post._count.likes,
      hasLiked,
    });
  } catch (error) {
    console.error("Fetch likes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch like status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to like a blog post" },
        { status: 401 }
      );
    }

    const { id } = params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Post not found or not published" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: session.id,
        },
      },
    });

    let hasLiked = false;

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      hasLiked = false;
    } else {
      await prisma.like.create({
        data: {
          postId: id,
          userId: session.id,
        },
      });
      hasLiked = true;
    }

    const updatedLikesCount = await prisma.like.count({
      where: { postId: id },
    });

    return NextResponse.json({
      success: true,
      hasLiked,
      likes: updatedLikesCount,
      message: hasLiked ? "Post liked" : "Post unliked",
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
}
