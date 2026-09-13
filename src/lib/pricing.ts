import type { PriceTier } from "./types";

const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  return `${nf.format(Math.round(value))} ₸`;
}

export function formatNumber(value: number) {
  return nf.format(value);
}

export function sortedTiers(tiers: PriceTier[] | null | undefined) {
  return (tiers ?? [])
    .filter((t) => t.min_qty > 1 && t.price > 0)
    .sort((a, b) => a.min_qty - b.min_qty);
}

/** Цена за штуку с учётом оптовых ступеней. */
export function unitPriceFor(basePrice: number, tiers: PriceTier[] | null | undefined, quantity: number) {
  let price = basePrice;
  for (const tier of sortedTiers(tiers)) {
    if (quantity >= tier.min_qty && tier.price < price) price = tier.price;
  }
  return price;
}

/** Ближайшая ступень, до которой не хватает количества — для подсказки «от N шт — дешевле». */
export function nextTier(tiers: PriceTier[] | null | undefined, quantity: number) {
  return sortedTiers(tiers).find((t) => t.min_qty > quantity) ?? null;
}

export function lowestPrice(basePrice: number, tiers: PriceTier[] | null | undefined) {
  return Math.min(basePrice, ...sortedTiers(tiers).map((t) => t.price));
}
