"use client";

import { useCart, cartTotals } from "@/store/cart";
import { useHydrated } from "@/lib/useHydrated";
import { IconCart } from "@/components/icons";

export default function CartButton() {
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const hydrated = useHydrated();
  const count = hydrated ? cartTotals(items).count : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="btn btn-dark btn-sm relative !min-h-11 !px-4"
      aria-label={count ? `Корзина, товаров: ${count}` : "Корзина"}
    >
      <IconCart />
      <span className="hidden sm:inline">Корзина</span>
      {count > 0 && (
        <span className="grid min-w-6 place-items-center rounded-full bg-cobalt px-1.5 font-mono text-xs leading-6">
          {count > 999 ? "999+" : count}
        </span>
      )}
    </button>
  );
}
