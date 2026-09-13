"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { formatPhoneInput } from "@/lib/text";
import { SITE } from "@/lib/site";
import { useHydrated } from "@/lib/useHydrated";
import { cartTotals, useCart } from "@/store/cart";
import type { OrderSummary } from "@/lib/order-message";
import CartLine from "./CartLine";

export const LAST_ORDER_KEY = "sanlux-last-order";

export default function Checkout() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, clear, remove } = useCart();
  const totals = cartTotals(items);
  const [loadedAt] = useState(() => Date.now());

  const [customerType, setCustomerType] = useState<"person" | "company">("person");
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!hydrated) {
    return <div className="container-x min-h-[60vh] py-10" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <h1 className="text-3xl font-semibold">Корзина пуста</h1>
        <p className="max-w-md text-ink-soft">Добавьте товары из каталога. Оформить заказ можно без регистрации — достаточно имени и телефона.</p>
        <Link href="/catalog" className="btn btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const payload = {
        customer_type: customerType,
        customer_name: form.get("customer_name"),
        customer_phone: phone,
        company_name: form.get("company_name"),
        company_bin: form.get("company_bin"),
        needs_invoice: form.get("needs_invoice") === "on",
        delivery_method: delivery,
        city: form.get("city"),
        address: form.get("address"),
        comment: form.get("comment"),
        website: form.get("website"),
        formLoadedAt: loadedAt,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && Array.isArray(data.staleIds)) data.staleIds.forEach((id: string) => remove(id));
      if (!res.ok) throw new Error(data.error || "Не удалось оформить заказ");

      const summary: OrderSummary = {
        number: data.number,
        customerName: String(payload.customer_name ?? ""),
        customerPhone: phone,
        companyName: customerType === "company" ? String(payload.company_name ?? "") : null,
        deliveryMethod: delivery,
        city: String(payload.city ?? ""),
        address: String(payload.address ?? ""),
        items: data.items,
        total: data.total,
      };
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ ...summary, demo: Boolean(data.demo) }));
      } catch {
        // приватный режим — страница «Спасибо» покажет общий текст
      }
      clear();
      router.push("/order/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось оформить заказ");
      setSending(false);
    }
  }

  return (
    <div className="container-x pb-16 pt-8 md:pb-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold sm:text-[2.6rem]">Оформление заказа</h1>
        <Link href="/cart/kp" className="btn btn-ghost btn-sm" target="_blank">
          Сформировать КП (PDF)
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-[var(--radius-card)] border border-grout bg-porcelain px-5 sm:px-7">
            <h2 className="sr-only">Состав заказа</h2>
            <ul className="divide-y divide-grout-soft">
              {items.map((item) => <CartLine key={item.productId} item={item} />)}
            </ul>
          </section>

          <section className="space-y-5 rounded-[var(--radius-card)] border border-grout bg-porcelain p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Покупатель</h2>
            <Segmented
              name="Тип покупателя"
              value={customerType}
              onChange={(v) => setCustomerType(v as "person" | "company")}
              options={[
                { value: "person", label: "Частное лицо" },
                { value: "company", label: "Компания (ИП, ТОО)" },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Имя *">
                <input name="customer_name" required autoComplete="name" className="field" maxLength={80} />
              </Field>
              <Field label="Телефон *">
                <input
                  name="customer_phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="field"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
                  title="Номер в формате +7 (707) 444-72-71"
                />
              </Field>
            </div>
            {customerType === "company" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Название компании *">
                  <input name="company_name" required className="field" maxLength={160} placeholder="ТОО «Строй Инвест»" />
                </Field>
                <Field label="БИН / ИИН">
                  <input name="company_bin" inputMode="numeric" pattern="\d{12}" title="12 цифр" maxLength={12} className="field font-mono" />
                </Field>
                <label className="flex items-center gap-2.5 sm:col-span-2">
                  <input type="checkbox" name="needs_invoice" defaultChecked className="size-4.5 accent-cobalt" />
                  Выставить счёт на оплату с НДС
                </label>
              </div>
            )}
          </section>

          <section className="space-y-5 rounded-[var(--radius-card)] border border-grout bg-porcelain p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Получение</h2>
            <Segmented
              name="Способ получения"
              value={delivery}
              onChange={(v) => setDelivery(v as "pickup" | "delivery")}
              options={[
                { value: "pickup", label: "Самовывоз" },
                { value: "delivery", label: "Доставка" },
              ]}
            />
            {delivery === "pickup" ? (
              <p className="text-ink-soft">
                {SITE.address.city}, {SITE.address.street}, {SITE.address.detail}. {SITE.hours.label}. Заказ в наличии соберём за 2 часа.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field label="Город">
                  <input name="city" defaultValue="Астана" className="field" maxLength={80} />
                </Field>
                <Field label="Адрес или объект *">
                  <input name="address" required className="field" maxLength={240} placeholder="Улица, дом или название ЖК" />
                </Field>
                <p className="text-sm text-chrome sm:col-span-2">По Астане — бесплатно от 50 000 ₸. В регионы — от 5 000 ₸, стоимость назовёт менеджер.</p>
              </div>
            )}
            <Field label="Комментарий">
              <textarea name="comment" rows={3} className="field resize-y" maxLength={2000} placeholder="Удобное время звонка, этаж, нужен ли подъём" />
            </Field>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          </section>
        </div>

        <aside className="space-y-4 rounded-[var(--radius-card)] border border-grout bg-porcelain p-5 sm:p-7 lg:sticky lg:top-44">
          <h2 className="text-xl font-semibold">Итого</h2>
          <dl className="space-y-2 text-[15px]">
            <div className="flex justify-between"><dt className="text-ink-soft">Товаров</dt><dd className="font-mono">{totals.count} шт</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">По розничной цене</dt><dd>{formatPrice(totals.retailTotal)}</dd></div>
            {totals.savings > 0 && (
              <div className="flex justify-between text-brass"><dt>Оптовая выгода</dt><dd>−{formatPrice(totals.savings)}</dd></div>
            )}
            <div className="flex items-baseline justify-between border-t border-grout pt-3">
              <dt className="font-medium">К оплате</dt>
              <dd className="font-display text-2xl">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <button type="submit" className="btn btn-primary w-full" disabled={sending}>
            {sending ? "Отправляем заказ…" : "Подтвердить заказ"}
          </button>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <p className="text-xs text-chrome">
            Оплата после подтверждения: наличными, картой, Kaspi или по счёту. Менеджер перезвонит в течение 15 минут в рабочее время.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={name} className="inline-flex rounded-full bg-glaze p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-10 rounded-full px-4 text-sm font-medium transition-colors sm:px-5 ${value === o.value ? "bg-porcelain text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
