import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const session = token ? verifySession(token) : null;

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
