import { formatPrice } from "./pricing";

export interface OrderSummary {
  number: number | null;
  customerName: string;
  customerPhone: string;
  companyName?: string | null;
  deliveryMethod: "pickup" | "delivery";
  city?: string | null;
  address?: string | null;
  items: { name: string; sku: string | null; quantity: number; unit_price: number; line_total: number }[];
  total: number;
}

/** Текст заказа для WhatsApp — менеджер видит состав сразу, без входа в админку. */
export function orderWhatsappText(o: OrderSummary) {
  const lines = [
    o.number ? `Здравствуйте! Оформил(а) заказ №${o.number} на сайте SanLux.` : "Здравствуйте! Хочу оформить заказ на сайте SanLux.",
    "",
    ...o.items.map(
      (i, idx) =>
        `${idx + 1}. ${i.name}${i.sku ? ` (арт. ${i.sku})` : ""} — ${i.quantity} шт × ${formatPrice(i.unit_price)} = ${formatPrice(i.line_total)}`,
    ),
    "",
    `Итого: ${formatPrice(o.total)}`,
    `Получение: ${o.deliveryMethod === "delivery" ? `доставка${o.city ? `, ${o.city}` : ""}${o.address ? `, ${o.address}` : ""}` : "самовывоз"}`,
    `Имя: ${o.customerName}${o.companyName ? `, ${o.companyName}` : ""}`,
    `Телефон: ${o.customerPhone}`,
  ];
  return lines.join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface AdminOrderNotice {
  number: number | null;
  customerType: "person" | "company";
  customerName: string;
  customerPhone: string;
  companyName?: string | null;
  companyBin?: string | null;
  needsInvoice?: boolean;
  deliveryMethod: "pickup" | "delivery";
  city?: string | null;
  address?: string | null;
  comment?: string | null;
  items: { name: string; sku: string | null; quantity: number; unit_price: number; line_total: number }[];
  total: number;
}

/** Текст уведомления в Telegram админу — чтобы узнать о заказе сразу, не заходя в /admin/orders. */
export function adminOrderTelegramText(o: AdminOrderNotice) {
  const lines = [
    `🛒 <b>${o.number ? `Новый заказ №${o.number}` : "Новый заказ (демо-режим, не сохранён в базе)"}</b>`,
    "",
    ...o.items.map(
      (i, idx) =>
        `${idx + 1}. ${escapeHtml(i.name)}${i.sku ? ` (${escapeHtml(i.sku)})` : ""} — ${i.quantity} шт × ${formatPrice(i.unit_price)} = ${formatPrice(i.line_total)}`,
    ),
    "",
    `<b>Итого: ${formatPrice(o.total)}</b>`,
    "",
    `👤 ${escapeHtml(o.customerName)}${o.companyName ? ` · ${escapeHtml(o.companyName)}` : ""}`,
    o.companyBin ? `БИН: ${escapeHtml(o.companyBin)}${o.needsInvoice ? " · нужен счёт с НДС" : ""}` : null,
    `📞 <a href="tel:${o.customerPhone}">${o.customerPhone}</a>`,
    o.deliveryMethod === "delivery"
      ? `🚚 Доставка: ${[o.city, o.address].filter((v): v is string => Boolean(v)).map(escapeHtml).join(", ") || "адрес не указан"}`
      : "🏠 Самовывоз",
    o.comment ? `💬 ${escapeHtml(o.comment)}` : null,
  ].filter((line): line is string => line !== null);
  return lines.join("\n");
}
