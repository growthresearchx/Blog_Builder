import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      comments,
      total: comments.length,
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to post a comment" },
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

    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Comment cannot exceed 2000 characters" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        userId: session.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment posted successfully",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
