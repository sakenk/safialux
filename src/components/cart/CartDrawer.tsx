"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { IconClose } from "@/components/icons";
import { formatPrice } from "@/lib/pricing";
import { useHydrated } from "@/lib/useHydrated";
import { cartTotals, useCart } from "@/store/cart";
import CartLine from "./CartLine";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer } = useCart();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = hydrated && isDrawerOpen;
  const totals = cartTotals(items);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeDrawer]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={closeDrawer} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        tabIndex={-1}
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-porcelain shadow-float outline-none transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-grout px-5 py-4">
          <h2 className="text-lg">Корзина</h2>
          <button type="button" onClick={closeDrawer} className="grid size-10 place-items-center rounded-full hover:bg-glaze" aria-label="Закрыть корзину">
            <IconClose />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-ink-soft">В корзине пока ничего нет. Добавьте товары из каталога — оформить заказ можно без регистрации.</p>
            <Link href="/catalog" className="btn btn-primary">Перейти в каталог</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-grout-soft overflow-y-auto px-5">
              {items.map((item) => (
                <CartLine key={item.productId} item={item} onNavigate={closeDrawer} />
              ))}
            </ul>
            <div className="space-y-3 border-t border-grout px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {totals.savings > 0 && (
                <p className="flex justify-between text-sm text-brass">
                  <span>Оптовая выгода</span>
                  <span>−{formatPrice(totals.savings)}</span>
                </p>
              )}
              <p className="flex items-baseline justify-between">
                <span className="text-ink-soft">Итого, {totals.count} шт</span>
                <span className="font-display text-xl">{formatPrice(totals.total)}</span>
              </p>
              <Link href="/cart" className="btn btn-primary w-full">Оформить заказ</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
