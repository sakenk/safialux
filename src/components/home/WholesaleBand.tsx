"use client";

import Link from "next/link";
import { useState } from "react";
import { formatNumber, formatPrice, unitPriceFor } from "@/lib/pricing";
import { WHOLESALE_POINTS } from "@/lib/content";
import type { PriceTier } from "@/lib/types";

const PRESETS = [1, 10, 50, 100];

export interface WholesaleSample {
  name: string;
  slug: string;
  price: number;
  tiers: PriceTier[];
}

export default function WholesaleBand({ sample }: { sample: WholesaleSample | null }) {
  const [qty, setQty] = useState(50);

  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="container-x grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-3 !text-brass">Опт · застройщики · тендеры</p>
          <h2 className="text-3xl font-semibold sm:text-[2.6rem]">Партия от 10 до 1000 штук — по оптовой цене</h2>
          <p className="mt-4 max-w-xl text-[17px] text-white/70">
            Комплектуем санузлы жилых комплексов, гостиниц и офисов. Цена за штуку снижается автоматически, как только
            количество в корзине доходит до оптовой ступени.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {WHOLESALE_POINTS.map((p) => (
              <li key={p.title} className="border-t border-white/15 pt-4">
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-sm text-white/60">{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/optom" className="btn btn-primary">Запросить коммерческое предложение</Link>
            <Link href="/catalog" className="btn border border-white/25 text-white hover:border-white">Собрать заказ в каталоге</Link>
          </div>
        </div>

        {sample && (
          <div className="self-center rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            <p className="eyebrow !text-white/45">Расчёт партии</p>
            <Link href={`/product/${sample.slug}`} className="mt-2 block text-lg font-medium hover:underline sm:text-xl">
              {sample.name}
            </Link>

            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Количество в партии">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQty(n)}
                  aria-pressed={qty === n}
                  className={`h-11 min-w-16 rounded-full border px-4 font-mono text-sm transition-colors ${
                    qty === n ? "border-cobalt bg-cobalt text-white" : "border-white/20 text-white/80 hover:border-white/60"
                  }`}
                >
                  ×{n}
                </button>
              ))}
            </div>

            <div className="mt-7 space-y-3">
              <Row label="Цена за штуку" value={formatPrice(unitPriceFor(sample.price, sample.tiers, qty))} />
              <Row label={`Сумма за ${formatNumber(qty)} шт`} value={formatPrice(unitPriceFor(sample.price, sample.tiers, qty) * qty)} big />
              {unitPriceFor(sample.price, sample.tiers, qty) < sample.price && (
                <Row
                  label="Экономия против розницы"
                  value={`−${formatPrice((sample.price - unitPriceFor(sample.price, sample.tiers, qty)) * qty)}`}
                  accent
                />
              )}
            </div>

            <table className="mt-7 w-full text-left text-sm">
              <caption className="sr-only">Ступени оптовых цен</caption>
              <thead className="text-white/45">
                <tr>
                  <th className="pb-2 font-normal">Количество</th>
                  <th className="pb-2 text-right font-normal">Цена за шт</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[{ min_qty: 1, price: sample.price }, ...sample.tiers].map((t) => (
                  <tr key={t.min_qty} className="border-t border-white/10">
                    <td className="py-2">от {t.min_qty} шт</td>
                    <td className="py-2 text-right">{formatPrice(t.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-white/15 pb-3">
      <span className="text-white/60">{label}</span>
      <span className={`${big ? "font-display text-2xl sm:text-3xl" : "font-semibold"} ${accent ? "text-brass" : "text-white"}`}>{value}</span>
    </div>
  );
}
