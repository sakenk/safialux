"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ categories }: { categories: { slug: string; name: string }[] }) {
  const pathname = usePathname();
  const links = [
    { href: "/catalog", label: "Весь каталог" },
    ...categories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.name })),
    { href: "/brands", label: "Бренды" },
    { href: "/optom", label: "Опт" },
  ];

  return (
    <ul className="scrollbar-none -mx-4 flex h-12 items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {links.map((link) => {
        const active = link.href === "/catalog" ? pathname === "/catalog" : pathname.startsWith(link.href);
        return (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-12 items-center px-3 text-[15px] transition-colors ${
                active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {link.label}
              {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-cobalt" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
