import {
  SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@nextgen-cms/studio/admin/session-token";
import { type NextRequest, NextResponse } from "next/server";

/** JWT-only gate for /admin routes; permission checks run in server components. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const signed = request.cookies.get(SESSION_COOKIE)?.value;
    const session = signed ? await verifyAdminSessionToken(signed) : null;

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
