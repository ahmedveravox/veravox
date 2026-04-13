import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protect dashboard + chat + profile + billing + referral
  const protectedPaths = ["/dashboard", "/profile", "/billing", "/referral", "/chat"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes – further check done in requireAdmin() server-side
  if (pathname.startsWith("/admin") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/register"];
  const isAuthPage = authPaths.some(p => pathname.startsWith(p));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.json|apple-icon\\.png).*)",
  ],
};
