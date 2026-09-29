import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/tag";
import { slugifyText } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tag: {
        ...tag,
        postCount: tag._count.posts,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { id } = params;

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const body = await req.json();
    const validation = tagSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid tag data" },
        { status: 400 }
      );
    }

    const { name } = validation.data;
    const trimmedName = name.trim().toLowerCase();
    const slug = validation.data.slug?.trim() || slugifyText(trimmedName);

    const conflict = await prisma.tag.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Another tag with this name or slug already exists" },
        { status: 409 }
      );
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: {
        name: trimmedName,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tag updated successfully",
      tag: updated,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Update tag error:", error);
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { id } = params;

    const existing = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Tag deleted successfully. Associated posts remain intact.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Delete tag error:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
