import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicAssetPattern = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const siteUnlocked = process.env.PUBLIC_SITE_UNLOCKED === "true";

  if (
    !isLocal &&
    !siteUnlocked &&
    pathname !== "/coming-soon" &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/assets") &&
    !publicAssetPattern.test(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
