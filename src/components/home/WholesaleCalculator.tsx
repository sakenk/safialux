"use client";

import Link from "next/link";
import { useState } from "react";
import { formatNumber, formatPrice, unitPriceFor } from "@/lib/pricing";
import type { PriceTier } from "@/lib/types";

const PRESETS = [1, 10, 50, 100];

export interface WholesaleSample {
  name: string;
  slug: string;
  price: number;
  tiers: PriceTier[];
}

export default function WholesaleCalculator({ sample }: { sample: WholesaleSample }) {
  const [qty, setQty] = useState(50);

  return (
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
