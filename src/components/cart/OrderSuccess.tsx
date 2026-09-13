"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { IconCheck, IconWhatsApp } from "@/components/icons";
import { orderWhatsappText, type OrderSummary } from "@/lib/order-message";
import { formatPrice } from "@/lib/pricing";
import { SITE, whatsappLink } from "@/lib/site";
import { LAST_ORDER_KEY } from "./Checkout";

type Stored = OrderSummary & { demo?: boolean };

function readOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

export default function OrderSuccess() {
  const raw = useSyncExternalStore(() => () => {}, readOrder, () => null);
  let order: Stored | null = null;
  try {
    order = raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    order = null;
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-2xl rounded-[28px] border border-grout bg-porcelain p-6 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
          <IconCheck width={32} height={32} />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">
          {order?.number ? `Заказ №${order.number} принят` : "Заказ принят"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Менеджер перезвонит{order?.customerPhone ? ` на ${order.customerPhone}` : ""} в течение 15 минут в рабочее время ({SITE.hours.label.toLowerCase()}), уточнит наличие и доставку.
        </p>
        {order?.demo && <p className="mt-2 text-sm text-brass">Демо-режим: заказ не сохранён в базе.</p>}

        {order && (
          <>
            <ul className="mt-8 divide-y divide-grout-soft border-y border-grout text-left">
              {order.items.map((i) => (
                <li key={i.name} className="flex justify-between gap-4 py-3 text-[15px]">
                  <span>{i.name} <span className="font-mono text-chrome">× {i.quantity}</span></span>
                  <span className="shrink-0 font-medium">{formatPrice(i.line_total)}</span>
                </li>
              ))}
              <li className="flex justify-between py-3 font-semibold">
                <span>Итого</span>
                <span className="font-display text-xl font-medium">{formatPrice(order.total)}</span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-ink-soft">
              Мы уже открыли WhatsApp с составом заказа — останется нажать «Отправить». Не открылось (браузер заблокировал вкладку)? Нажмите кнопку ниже.
            </p>
            <a href={whatsappLink(orderWhatsappText(order))} target="_blank" rel="noopener" className="btn btn-whatsapp mt-3">
              <IconWhatsApp /> Открыть WhatsApp с заказом
            </a>
          </>
        )}

        <div className="mt-6">
          <Link href="/catalog" className="font-medium text-cobalt hover:underline">Вернуться в каталог</Link>
        </div>
      </div>
    </div>
  );
}
