import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/tag";
import { slugifyText } from "@/lib/utils";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json({
      success: true,
      tags: tags.map((t) => ({
        ...t,
        postCount: t._count.posts,
      })),
    });
  } catch (error) {
    console.error("Fetch tags error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

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

    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A tag with this name or slug already exists" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: trimmedName,
        slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tag created successfully",
        tag: {
          ...tag,
          postCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Create tag error:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
