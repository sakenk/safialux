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
