"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconFilter } from "@/components/icons";
import type { ParsedCatalogParams } from "@/lib/catalog-params";
import { formatNumber } from "@/lib/pricing";

export default function FilterForm({
  basePath,
  params,
  brands,
  priceRange,
  sorts,
}: {
  basePath: string;
  params: ParsedCatalogParams;
  brands: { id: string; slug: string; name: string; count: number }[];
  priceRange: [number, number];
  sorts: Record<string, string>;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  // Без JS форма отправляется кнопкой «Показать»; с JS — сразу при изменении.
  function submit() {
    const form = formRef.current;
    if (!form) return;
    const usp = new URLSearchParams();
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === "string" && value.trim() && !(key === "sort" && value === "popular")) usp.append(key, value.trim());
    }
    const qs = usp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  const activeCount =
    params.brandSlugs.length + Number(Boolean(params.minPrice || params.maxPrice)) + Number(params.inStock) + Number(params.sale);

  return (
    <div className="rounded-[var(--radius-card)] border border-grout bg-porcelain lg:sticky lg:top-44">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 p-4 font-medium lg:hidden">
        <span className="flex items-center gap-2"><IconFilter /> Фильтры и сортировка{activeCount ? ` · ${activeCount}` : ""}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={`text-chrome transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <form
        ref={formRef}
        action={basePath}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onChange={(e) => {
          // Текстовые поля отправляются по Enter или кнопке, остальные — сразу
          const type = (e.target as unknown as HTMLInputElement).type;
          if (type !== "search" && type !== "text") submit();
        }}
        className={`${open ? "block" : "hidden"} space-y-6 border-t border-grout p-4 lg:block lg:border-t-0 lg:p-5`}
      >
        <div>
          <label htmlFor="f-q" className="label">Поиск</label>
          <input id="f-q" name="q" type="search" defaultValue={params.q} placeholder="Название или артикул" className="field" autoFocus={false} />
        </div>

        <div>
          <label htmlFor="f-sort" className="label">Сортировка</label>
          <select id="f-sort" name="sort" defaultValue={params.sort} className="field appearance-none">
            {Object.entries(sorts).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">Цена, ₸</legend>
          <div className="grid grid-cols-2 gap-2">
            <input name="min" type="text" inputMode="numeric" defaultValue={params.minPrice} placeholder={`от ${formatNumber(priceRange[0])}`} aria-label="Цена от" className="field" />
            <input name="max" type="text" inputMode="numeric" defaultValue={params.maxPrice} placeholder={`до ${formatNumber(priceRange[1])}`} aria-label="Цена до" className="field" />
          </div>
        </fieldset>

        <fieldset className="space-y-2.5">
          <legend className="label">Наличие и акции</legend>
          <Check name="stock" label="Только в наличии" checked={params.inStock} />
          <Check name="sale" label="Со скидкой" checked={params.sale} />
        </fieldset>

        {brands.length > 0 && (
          <fieldset className="space-y-2.5">
            <legend className="label">Бренд</legend>
            {brands.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                <input type="checkbox" name="brand" value={b.slug} defaultChecked={params.brandSlugs.includes(b.slug)} className="size-4.5 accent-cobalt" />
                <span className="flex-1">{b.name}</span>
                <span className="font-mono text-xs text-chrome">{b.count}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary btn-sm flex-1">Показать</button>
          {params.hasFilters && <Link href={basePath} className="btn btn-ghost btn-sm">Сбросить</Link>}
        </div>
      </form>
    </div>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="size-4.5 accent-cobalt" />
      {label}
    </label>
  );
}
