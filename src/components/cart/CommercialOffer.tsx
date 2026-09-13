"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { useHydrated } from "@/lib/useHydrated";
import { cartTotals, lineUnitPrice, useCart } from "@/store/cart";

/** Печатная форма КП: «Сохранить как PDF» в диалоге печати браузера. */
export default function CommercialOffer() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const totals = cartTotals(items);
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-glaze py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <Link href="/cart" className="text-sm text-cobalt hover:underline">← Вернуться в корзину</Link>
        <button type="button" onClick={() => window.print()} className="btn btn-primary btn-sm" disabled={!items.length}>
          Скачать PDF / распечатать
        </button>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white p-6 text-[13px] leading-relaxed text-ink shadow-lift sm:p-[14mm] print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
          <div>
            <Image src="/brand/sanlux-logo.png" alt={SITE.name} width={205} height={51} className="h-10 w-auto" />
            <p className="mt-2 text-ink-soft">Продажа сантехнического оборудования</p>
          </div>
          <div className="text-right text-ink-soft">
            <p>{SITE.address.city}, {SITE.address.street}</p>
            <p>{SITE.address.detail}</p>
            <p>{SITE.phones.map((p) => p.display).join(" · ")}</p>
            <p>{SITE.email} · {SITE.url.replace(/^https?:\/\//, "")}</p>
          </div>
        </header>

        <h1 className="mt-6 font-display text-2xl">Коммерческое предложение</h1>
        <p className="text-ink-soft">от {today}. Цены в тенге, с учётом оптовых ступеней на указанное количество.</p>

        {items.length === 0 ? (
          <p className="mt-8">Корзина пуста — добавьте товары, чтобы сформировать предложение.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink text-xs uppercase tracking-wide text-ink-soft">
                  <th className="py-2 pr-2">№</th>
                  <th className="py-2 pr-2">Наименование</th>
                  <th className="py-2 pr-2">Артикул</th>
                  <th className="py-2 pr-2 text-right">Кол-во</th>
                  <th className="py-2 pr-2 text-right">Цена</th>
                  <th className="py-2 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const unit = lineUnitPrice(item);
                  return (
                    <tr key={item.productId} className="border-b border-grout align-top">
                      <td className="py-2 pr-2">{i + 1}</td>
                      <td className="py-2 pr-2">{item.name}</td>
                      <td className="py-2 pr-2 font-mono text-xs">{item.sku ?? "—"}</td>
                      <td className="py-2 pr-2 text-right font-mono">{item.quantity}</td>
                      <td className="py-2 pr-2 text-right">{formatPrice(unit)}</td>
                      <td className="py-2 text-right font-semibold">{formatPrice(unit * item.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {totals.savings > 0 && (
                  <tr>
                    <td colSpan={5} className="pt-3 text-right text-ink-soft">Оптовая скидка</td>
                    <td className="pt-3 text-right">−{formatPrice(totals.savings)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={5} className="pt-2 text-right text-base font-semibold">Итого ({totals.count} шт)</td>
                  <td className="pt-2 text-right font-display text-lg">{formatPrice(totals.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <section className="mt-8 grid gap-4 border-t border-grout pt-5 text-ink-soft sm:grid-cols-2">
          <div>
            <p className="font-semibold text-ink">Условия</p>
            <p>Предложение действительно 5 рабочих дней. Наличие и сроки поставки подтверждает менеджер. Гарантия производителя до 5 лет.</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Доставка и оплата</p>
            <p>По Астане бесплатно от 50 000 ₸, в регионы — по расчёту. Оплата по счёту для ИП и ТОО, наличными или картой.</p>
          </div>
        </section>
      </article>
    </div>
  );
}
