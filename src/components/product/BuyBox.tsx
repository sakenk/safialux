"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddToCartButton from "@/components/catalog/AddToCartButton";
import QuantityInput from "@/components/cart/QuantityInput";
import { IconWhatsApp } from "@/components/icons";
import { formatPrice, nextTier, sortedTiers, unitPriceFor } from "@/lib/pricing";
import { SITE, whatsappLink } from "@/lib/site";
import { useCart, type CartItem } from "@/store/cart";

const PRESETS = [1, 10, 50, 100];

export default function BuyBox({
  item,
  oldPrice,
  inStock,
  productUrl,
}: {
  item: Omit<CartItem, "quantity">;
  oldPrice: number | null;
  inStock: boolean;
  productUrl: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const tiers = sortedTiers(item.wholesalePrices);
  const unit = unitPriceFor(item.price, tiers, qty);
  const upcoming = nextTier(tiers, qty);

  function buyNow() {
    add(item, qty);
    router.push("/cart");
  }

  const askText = `Здравствуйте! Интересует «${item.name}»${item.sku ? ` (арт. ${item.sku})` : ""}, ${qty} шт. ${productUrl}`;

  return (
    <div className="rounded-[28px] border border-grout bg-porcelain p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-3xl font-medium sm:text-4xl">{formatPrice(unit)}</span>
        {unit < item.price ? (
          <s className="text-lg text-chrome">{formatPrice(item.price)}</s>
        ) : (
          oldPrice && oldPrice > item.price && <s className="text-lg text-chrome">{formatPrice(oldPrice)}</s>
        )}
        <span className="text-sm text-chrome">за штуку</span>
      </div>
      <p className={`mt-2 flex items-center gap-2 text-sm ${inStock ? "text-success" : "text-brass"}`}>
        <span className={`size-2 rounded-full ${inStock ? "bg-success" : "bg-brass"}`} />
        {inStock ? "В наличии в Астане" : "Под заказ — срок уточнит менеджер"}
      </p>

      {tiers.length > 0 && (
        <div className="mt-6">
          <p className="label">Оптовые цены</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
            {[{ min_qty: 1, price: item.price }, ...tiers].map((t, i, arr) => {
              const nextMin = arr[i + 1]?.min_qty ?? Infinity;
              const active = qty >= t.min_qty && qty < nextMin;
              return (
                <button
                  key={t.min_qty}
                  type="button"
                  onClick={() => setQty(t.min_qty)}
                  aria-pressed={active}
                  className={`rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                    active ? "border-cobalt bg-cobalt-wash" : "border-grout hover:border-ink"
                  }`}
                >
                  <span className="block font-mono text-xs text-chrome">от {t.min_qty} шт</span>
                  <span className="block font-semibold">{formatPrice(t.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="label">Количество</p>
        <div className="flex flex-wrap items-center gap-2">
          <QuantityInput value={qty} onChange={setQty} />
          {PRESETS.slice(1).map((n) => (
            <button key={n} type="button" onClick={() => setQty(n)} className={`h-12 rounded-full border px-4 font-mono text-sm ${qty === n ? "border-ink bg-ink text-white" : "border-grout hover:border-ink"}`}>
              ×{n}
            </button>
          ))}
        </div>
        {upcoming && (
          <p className="mt-2 text-sm text-brass">
            Добавьте ещё {upcoming.min_qty - qty} шт — цена снизится до {formatPrice(upcoming.price)}
          </p>
        )}
        {qty > 1 && (
          <p className="mt-3 flex justify-between border-t border-dashed border-grout pt-3">
            <span className="text-ink-soft">Сумма за {qty} шт</span>
            <span className="font-semibold">{formatPrice(unit * qty)}</span>
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <AddToCartButton item={item} quantity={qty} />
        <button type="button" onClick={buyNow} className="btn btn-dark w-full">Купить в 1 клик</button>
      </div>
      <a href={whatsappLink(askText)} target="_blank" rel="noopener" className="btn btn-ghost mt-2 w-full">
        <IconWhatsApp className="text-[#1fae5b]" /> Спросить в WhatsApp
      </a>
      <p className="mt-4 text-center text-xs text-chrome">
        Без регистрации · подтвердим заказ по телефону · {SITE.hours.label}
      </p>
    </div>
  );
}
