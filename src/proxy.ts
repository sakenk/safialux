import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";

// Первый рубеж для админки. Каждая страница и API-роут дополнительно проверяют сессию сами.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login" || authed) return NextResponse.next();
    return NextResponse.json({ error: "Войдите в админку заново" }, { status: 401 });
  }

  if (pathname !== "/admin" && !authed) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
