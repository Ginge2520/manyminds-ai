import { NextResponse } from "next/server";

export async function middleware() {
  // Prototype mode: keep the app open so the real agent workflow can be tested
  // without the temporary auth layer blocking progress.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/agent-test/:path*", "/onboarding", "/login"],
};
