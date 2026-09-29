import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_analyticsliv_jwt_key_2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let user: { id: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      user = payload as unknown as { id: string; email: string; role: string };
    } catch {
      user = null;
    }
  }

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const isEmployeePage = pathname.startsWith("/employee");
  const isAdminApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/employees");

  if (isAuthPage && user) {
    const redirectUrl = user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (isAdminPage) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/employee/dashboard", request.url));
    }
  }

  if (isEmployeePage) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminApi) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/login",
    "/signup",
    "/api/admin/:path*",
    "/api/employees/:path*",
  ],
};
