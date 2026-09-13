"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SmartImage from "@/components/SmartImage";
import { formatPrice, sortedTiers } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { adminRequest } from "./api";

type Option = { id: string; name: string };
type Flag = "is_published" | "in_stock" | "is_featured" | "is_new" | "is_sale";

const FLAGS: { key: Flag; label: string }[] = [
  { key: "is_published", label: "На сайте" },
  { key: "in_stock", label: "В наличии" },
  { key: "is_featured", label: "Хит" },
  { key: "is_new", label: "Новинка" },
];

export default function ProductsTable({ products, categories, brands }: { products: Product[]; categories: Option[]; brands: Option[] }) {
  const [rows, setRows] = useState(products);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [visibility, setVisibility] = useState("");
  const [error, setError] = useState("");

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const brandName = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);

  const filtered = rows.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (!q || `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(q)) &&
      (!categoryId || p.category_id === categoryId) &&
      (!visibility || (visibility === "hidden" ? !p.is_published : p.is_published))
    );
  });

  async function patch(id: string, change: Partial<Product>) {
    const before = rows;
    setRows((r) => r.map((p) => (p.id === id ? { ...p, ...change } : p)));
    setError("");
    try {
      await adminRequest(`/api/admin/products/${id}`, "PATCH", change);
    } catch (err) {
      setRows(before);
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 rounded-2xl border border-grout bg-porcelain p-4">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Название или артикул" aria-label="Поиск" className="field !min-h-10 max-w-xs !py-2" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Категория" className="field !min-h-10 !w-auto !py-2">
          <option value="">Все категории</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} aria-label="Видимость" className="field !min-h-10 !w-auto !py-2">
          <option value="">На сайте и скрытые</option>
          <option value="published">Только на сайте</option>
          <option value="hidden">Только скрытые</option>
        </select>
        <p className="ml-auto self-center font-mono text-sm text-chrome">{filtered.length} шт</p>
      </div>
      {error && <p className="rounded-xl bg-danger/10 px-4 py-2 text-sm text-danger" role="alert">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-grout bg-porcelain">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-grout text-xs uppercase tracking-wide text-chrome">
            <tr>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3 text-right">Цена</th>
              <th className="px-4 py-3">Опт</th>
              {FLAGS.map((f) => <th key={f.key} className="px-2 py-3 text-center">{f.label}</th>)}
              <th className="px-4 py-3" title="Больше — выше в «Популярных»">Порядок</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grout-soft">
            {filtered.map((p) => (
              <tr key={p.id} className={p.is_published ? "" : "bg-glaze/70 text-ink-soft"}>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-cobalt">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-glaze">
                      {p.images[0] && <SmartImage src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}
                    </span>
                    <span>
                      <span className="block font-medium">{p.name}</span>
                      <span className="block font-mono text-xs text-chrome">{[p.sku, p.brand_id && brandName.get(p.brand_id)].filter(Boolean).join(" · ") || "—"}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5">{catName.get(p.category_id) ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-medium">{formatPrice(p.price)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-brass">
                  {sortedTiers(p.wholesale_prices).map((t) => `${t.min_qty}+`).join(" / ") || "—"}
                </td>
                {FLAGS.map((f) => (
                  <td key={f.key} className="px-2 py-2.5 text-center">
                    <input type="checkbox" checked={p[f.key]} onChange={(e) => patch(p.id, { [f.key]: e.target.checked })} aria-label={`${f.label}: ${p.name}`} className="size-4.5 accent-cobalt" />
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    defaultValue={p.sort_order}
                    onBlur={(e) => Number(e.target.value) !== p.sort_order && patch(p.id, { sort_order: Number(e.target.value) })}
                    aria-label={`Порядок: ${p.name}`}
                    className="field !min-h-9 !w-20 !px-2 !py-1 font-mono"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-ink-soft">Ничего не найдено. Измените фильтры или добавьте товар.</p>}
      </div>
    </div>
  );
}
