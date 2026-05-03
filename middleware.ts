import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, sessionCookieName } from "./lib/session";

const protectedPrefixes = ["/dashboard", "/account", "/agent-test"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionToken(request.cookies.get(sessionCookieName)?.value);
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if ((isProtected || pathname === "/onboarding") && !session) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/agent-test/:path*", "/onboarding", "/login"],
};
