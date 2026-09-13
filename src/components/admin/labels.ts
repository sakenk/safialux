import { SITE } from "@/lib/site";
import type { LeadStatus, Order, OrderStatus } from "@/lib/types";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "Новый", className: "bg-cobalt text-white" },
  processing: { label: "В работе", className: "bg-brass-wash text-brass" },
  done: { label: "Выполнен", className: "bg-success/10 text-success" },
  cancelled: { label: "Отменён", className: "bg-grout-soft text-chrome" },
};

export const LEAD_STATUS: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "Новая", className: "bg-cobalt text-white" },
  in_work: { label: "В работе", className: "bg-brass-wash text-brass" },
  closed: { label: "Закрыта", className: "bg-grout-soft text-chrome" },
};

export const LEAD_SOURCE: Record<string, string> = {
  "home-podbor": "Подбор (главная)",
  wholesale: "КП для опта",
  "product-wholesale": "Партия из карточки",
  contacts: "Контакты",
};

/** Крупный заказ: много штук одной позиции или большая сумма. */
export function isBigOrder(o: Pick<Order, "items" | "total">) {
  return o.total >= SITE.wholesale.total || o.items.some((i) => i.quantity >= SITE.wholesale.qty);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatKzPhone(phone: string) {
  const d = phone.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}` : phone;
}
