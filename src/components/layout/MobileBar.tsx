"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, whatsappLink } from "@/lib/site";
import { useHydrated } from "@/lib/useHydrated";
import { cartTotals, useCart } from "@/store/cart";
import { IconCart, IconGrid, IconHome, IconSearch, IconWhatsApp } from "@/components/icons";

export default function MobileBar() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const count = useHydrated() ? cartTotals(items).count : 0;

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]";
  const color = (active: boolean) => (active ? "text-cobalt" : "text-ink-soft");

  return (
    <nav
      aria-label="Быстрая навигация"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(60px+env(safe-area-inset-bottom))] border-t border-grout bg-porcelain/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <Link href="/" className={`${item} ${color(pathname === "/")}`}>
        <IconHome /> Главная
      </Link>
      <Link href="/catalog" className={`${item} ${color(pathname.startsWith("/catalog"))}`}>
        <IconGrid /> Каталог
      </Link>
      <Link href="/catalog?focus=search" className={`${item} text-ink-soft`}>
        <IconSearch /> Поиск
      </Link>
      <button type="button" onClick={openDrawer} className={`${item} relative text-ink-soft`}>
        <IconCart /> Корзина
        {count > 0 && (
          <span className="absolute left-1/2 top-1.5 ml-1.5 grid min-w-5 place-items-center rounded-full bg-cobalt px-1 font-mono text-[10px] leading-5 text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <a href={whatsappLink(`Здравствуйте! Пишу с сайта ${SITE.name}.`)} target="_blank" rel="noopener" className={`${item} text-[#178a48]`}>
        <IconWhatsApp /> WhatsApp
      </a>
    </nav>
  );
}
