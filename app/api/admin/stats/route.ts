import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const totalBlogs = await prisma.post.count();

    const viewsAggregate = await prisma.post.aggregate({
      _sum: {
        viewCount: true,
      },
    });
    const totalViews = viewsAggregate._sum.viewCount || 0;

    const mostActive = await prisma.user.findFirst({
      where: { role: Role.EMPLOYEE },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
    });

    const mostActiveEmployee =
      mostActive && mostActive._count.posts > 0
        ? {
            id: mostActive.id,
            name: mostActive.name,
            email: mostActive.email,
            avatar: mostActive.avatar,
            blogCount: mostActive._count.posts,
          }
        : null;

    return NextResponse.json({
      success: true,
      stats: {
        totalBlogs,
        totalViews,
        mostActiveEmployee,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 });
  }
}
