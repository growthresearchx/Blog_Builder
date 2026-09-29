import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category";
import { slugifyText } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        postCount: category._count.posts,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { id } = params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid category data" },
        { status: 400 }
      );
    }

    const { name } = validation.data;
    const trimmedName = name.trim();
    const slug = validation.data.slug?.trim() || slugifyText(trimmedName);

    const conflict = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: { equals: trimmedName, mode: "insensitive" } }, { slug }],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Another category with this name or slug already exists" },
        { status: 409 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: trimmedName,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const { id } = params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully. Associated posts remain preserved.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
