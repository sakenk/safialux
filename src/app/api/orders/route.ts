import { NextRequest, NextResponse } from "next/server";
import { getOrderableProducts, isDemoMode } from "@/lib/data";
import { unitPriceFor } from "@/lib/pricing";
import { cleanMultiline, cleanText, clientIp, looksLikeBot, rateLimit } from "@/lib/rate-limit";
import { adminDb } from "@/lib/supabase";
import { normalizeKzPhone } from "@/lib/text";
import type { OrderItem } from "@/lib/types";

const MAX_LINES = 100;
const MAX_QTY = 9999;

export async function POST(req: NextRequest) {
  if (!rateLimit(`order:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много заказов подряд. Позвоните нам — оформим по телефону." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (looksLikeBot(body)) {
    return NextResponse.json({ error: "Не удалось отправить заказ. Обновите страницу и попробуйте ещё раз." }, { status: 400 });
  }

  const customerName = cleanText(body.customer_name, 80);
  const customerPhone = normalizeKzPhone(String(body.customer_phone ?? ""));
  if (!customerName) return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  if (!customerPhone) return NextResponse.json({ error: "Укажите телефон в формате +7 (7XX) XXX-XX-XX" }, { status: 400 });

  const customerType = body.customer_type === "company" ? "company" : "person";
  const companyName = customerType === "company" ? cleanText(body.company_name, 160) : null;
  const companyBin = customerType === "company" ? cleanText(body.company_bin, 12)?.replace(/\D/g, "") || null : null;
  if (customerType === "company" && !companyName) {
    return NextResponse.json({ error: "Укажите название компании" }, { status: 400 });
  }
  if (companyBin && companyBin.length !== 12) {
    return NextResponse.json({ error: "БИН/ИИН должен состоять из 12 цифр" }, { status: 400 });
  }

  const deliveryMethod = body.delivery_method === "delivery" ? "delivery" : "pickup";
  const address = deliveryMethod === "delivery" ? cleanText(body.address, 240) : null;
  if (deliveryMethod === "delivery" && !address) {
    return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
  }

  // Количество суммируем по товару: цену и оптовую ступень определяет сервер, а не корзина.
  const requested = new Map<string, number>();
  for (const raw of Array.isArray(body.items) ? body.items.slice(0, MAX_LINES) : []) {
    const id = typeof raw?.product_id === "string" ? raw.product_id : null;
    const qty = Math.floor(Number(raw?.quantity));
    if (!id || !Number.isFinite(qty) || qty < 1) continue;
    requested.set(id, Math.min(MAX_QTY, (requested.get(id) ?? 0) + qty));
  }
  if (requested.size === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  const products = await getOrderableProducts([...requested.keys()]);
  if (products.length !== requested.size) {
    return NextResponse.json(
      { error: "Некоторые товары больше не продаются. Обновите корзину и проверьте состав заказа.", staleIds: [...requested.keys()].filter((id) => !products.some((p) => p.id === id)) },
      { status: 409 },
    );
  }

  const items: OrderItem[] = products.map((p) => {
    const quantity = requested.get(p.id)!;
    const unit = unitPriceFor(p.price, p.wholesale_prices, quantity);
    return {
      product_id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      image: p.images[0]?.url ?? null,
      unit_price: unit,
      quantity,
      line_total: unit * quantity,
    };
  });
  const total = items.reduce((sum, i) => sum + i.line_total, 0);
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const order = {
    customer_type: customerType,
    customer_name: customerName,
    customer_phone: customerPhone,
    company_name: companyName,
    company_bin: companyBin,
    needs_invoice: customerType === "company" && Boolean(body.needs_invoice),
    city: cleanText(body.city, 80),
    delivery_method: deliveryMethod,
    address,
    comment: cleanMultiline(body.comment, 2000),
    items,
    items_count: itemsCount,
    total,
  };

  if (isDemoMode) {
    return NextResponse.json({ number: null, demo: true, items, total }, { status: 201 });
  }

  const { data, error } = await adminDb().from("orders").insert(order).select("number").single();
  if (error) {
    console.error("[orders] insert failed:", error.message);
    return NextResponse.json({ error: "Не удалось сохранить заказ. Позвоните нам — оформим по телефону." }, { status: 500 });
  }

  return NextResponse.json({ number: data.number, items, total }, { status: 201 });
}
