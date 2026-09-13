import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/data";
import { cleanMultiline, cleanText, clientIp, looksLikeBot, rateLimit } from "@/lib/rate-limit";
import { adminDb } from "@/lib/supabase";
import { normalizeKzPhone } from "@/lib/text";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!rateLimit(`lead:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много заявок подряд. Позвоните нам по телефону." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  if (looksLikeBot(body)) {
    return NextResponse.json({ error: "Не удалось отправить заявку. Обновите страницу и попробуйте ещё раз." }, { status: 400 });
  }

  const name = cleanText(body.name, 80);
  const phone = normalizeKzPhone(String(body.phone ?? ""));
  if (!name) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Укажите телефон в формате +7 (7XX) XXX-XX-XX" }, { status: 400 });

  const lead = {
    name,
    phone,
    company_name: cleanText(body.company_name, 160),
    message: cleanMultiline(body.message, 3000),
    source: cleanText(body.source, 40) ?? "site",
    product_id: typeof body.product_id === "string" && UUID.test(body.product_id) ? body.product_id : null,
  };

  if (isDemoMode) return NextResponse.json({ ok: true, demo: true }, { status: 201 });

  const { error } = await adminDb().from("leads").insert(lead);
  if (error) {
    console.error("[leads] insert failed:", error.message);
    return NextResponse.json({ error: "Не удалось сохранить заявку. Позвоните нам по телефону." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
