"use client";

import { useState } from "react";
import { adminRequest } from "./api";

interface Option {
  id: string;
  slug: string;
}

interface RowResult {
  line: number;
  name: string;
  error?: string;
}

/** Разбор CSV с кавычками: запятая-разделитель, "" внутри кавычек, переводы строк внутри поля. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

const flag = (v: string | undefined) => (v ?? "").trim().toLowerCase() === "true";

export default function ProductsImport({ categories, brands }: { categories: Option[]; brands: Option[] }) {
  const [csv, setCsv] = useState("");
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  }

  async function run() {
    setBusy(true);
    setResults(null);
    const [header, ...body] = parseCsv(csv);
    const out: RowResult[] = [];
    for (const [i, cells] of body.entries()) {
      const r = Object.fromEntries(header.map((h, c) => [h.trim(), (cells[c] ?? "").trim()]));
      const line = i + 2;
      const category = categories.find((c) => c.slug === r.category_slug);
      const brand = brands.find((b) => b.slug === r.brand_slug);
      if (!category) {
        out.push({ line, name: r.name, error: `Нет категории «${r.category_slug}»` });
        continue;
      }
      if (r.brand_slug && !brand) {
        out.push({ line, name: r.name, error: `Нет бренда «${r.brand_slug}»` });
        continue;
      }
      const tiers = [
        { min_qty: 10, price: r.wholesale_10 },
        { min_qty: 50, price: r.wholesale_50 },
      ].filter((t) => t.price);
      const specs = (r.specs ? r.specs.split(";") : [])
        .map((s) => s.split("="))
        .map(([label, ...value]) => ({ label: label?.trim() ?? "", value: value.join("=").trim() }));
      const images = (r.image_urls ? r.image_urls.split(";") : []).map((url) => ({ url: url.trim(), alt: r.name }));
      try {
        await adminRequest("/api/admin/products", "POST", {
          name: r.name,
          slug: r.slug,
          category_id: category.id,
          brand_id: brand?.id ?? null,
          sku: r.sku,
          description: r.description,
          price: r.price,
          old_price: r.old_price,
          wholesale_prices: tiers,
          images,
          specs,
          in_stock: flag(r.in_stock),
          is_featured: flag(r.is_featured),
          is_new: flag(r.is_new),
          is_sale: flag(r.is_sale),
          is_published: publish,
          meta_title: r.meta_title,
          meta_description: r.meta_description,
        });
        out.push({ line, name: r.name });
      } catch (err) {
        out.push({ line, name: r.name, error: err instanceof Error ? err.message : "Не удалось сохранить" });
      }
    }
    setResults(out);
    setBusy(false);
  }

  const failed = results?.filter((r) => r.error) ?? [];

  return (
    <div className="space-y-4">
      <input type="file" accept=".csv,text/csv" onChange={onFile} />
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={10}
        placeholder="Или вставьте содержимое CSV сюда"
        className="w-full rounded-xl border border-grout p-3 font-mono text-xs"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Показывать на сайте сразу (иначе товары загрузятся скрытыми)
      </label>
      <button type="button" onClick={run} disabled={busy || !csv.trim()} className="btn btn-primary">
        {busy ? "Загружаю…" : "Загрузить товары"}
      </button>

      {results && (
        <div className="rounded-xl border border-grout p-4 text-sm">
          <p className="font-semibold">
            Загружено: {results.length - failed.length} из {results.length}
          </p>
          {failed.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-red-600">
              {failed.map((r) => (
                <li key={r.line}>
                  Строка {r.line}, {r.name}: {r.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
