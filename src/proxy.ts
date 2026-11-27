import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PAGES = new Set(["/", "/login", "/invite"]);

// Next.js 16 calls this file proxy.ts (formerly middleware.ts).
// This cookie is only a navigation hint. It does not authorize any API request;
// NestJS verifies the JWT, business membership, role and branch scope.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC_PAGES.has(path)) return NextResponse.next();

  if (!request.cookies.has("hrms_signed_in")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"],
};
