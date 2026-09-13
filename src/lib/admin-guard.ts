import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "./admin-auth";

export async function isAdminRequest() {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Для страниц админки: редирект на вход, если сессии нет. */
export async function requireAdminPage() {
  if (!(await isAdminRequest())) redirect("/admin");
}

/** Для API: вернёт готовый 401-ответ, если сессии нет. */
export async function adminApiGuard() {
  if (await isAdminRequest()) return null;
  return NextResponse.json({ error: "Войдите в админку заново" }, { status: 401 });
}
