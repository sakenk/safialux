"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav({ newOrders, newLeads }: { newOrders: number; newLeads: number }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin/orders", label: "Заказы", badge: newOrders },
    { href: "/admin/leads", label: "Заявки", badge: newLeads },
    { href: "/admin/products", label: "Товары" },
    { href: "/admin/categories", label: "Категории" },
    { href: "/admin/brands", label: "Бренды" },
  ];

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-grout bg-porcelain print:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/admin/orders" className="shrink-0 py-3">
          <Image src="/brand/sanlux-logo.png" alt="SanLux" width={205} height={51} className="h-7 w-auto" />
        </Link>
        <nav className="scrollbar-none flex flex-1 overflow-x-auto">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex h-14 shrink-0 items-center gap-2 px-3 text-[15px] ${active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                {l.label}
                {!!l.badge && <span className="rounded-full bg-cobalt px-1.5 font-mono text-xs leading-5 text-white">{l.badge}</span>}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-cobalt" />}
              </Link>
            );
          })}
        </nav>
        <Link href="/" target="_blank" className="hidden text-sm text-ink-soft hover:text-ink sm:block">Открыть сайт ↗</Link>
        <button type="button" onClick={logout} className="text-sm text-ink-soft hover:text-danger">Выйти</button>
      </div>
    </header>
  );
}
