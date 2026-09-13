import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken, isAdminConfigured } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Задайте ADMIN_PASSWORD в .env.local и перезапустите сервер" }, { status: 503 });
  }
  if (!rateLimit(`login:${clientIp(req.headers)}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
  }

  const { password } = await req.json().catch(() => ({ password: null }));
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
