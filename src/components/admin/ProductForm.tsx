"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { slugify } from "@/lib/text";
import type { PriceTier, Product, ProductImage, ProductSpec } from "@/lib/types";
import { adminRequest } from "./api";
import ImageUploader from "./ImageUploader";
import { Card, Field, Toggle } from "./FormParts";

type Option = { id: string; name: string };

const SPEC_PRESETS = ["Размер", "Материал", "Монтаж", "Цвет", "Страна", "Гарантия"];

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const isNew = !product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(product?.old_price ? String(product.old_price) : "");
  const [tiers, setTiers] = useState<{ min_qty: string; price: string }[]>(
    (product?.wholesale_prices ?? []).map((t: PriceTier) => ({ min_qty: String(t.min_qty), price: String(t.price) })),
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [specs, setSpecs] = useState<ProductSpec[]>(product?.specs?.length ? product.specs : [{ label: "Размер", value: "" }]);
  const [description, setDescription] = useState(product?.description ?? "");
  const [flags, setFlags] = useState({
    is_published: product?.is_published ?? true,
    in_stock: product?.in_stock ?? true,
    is_featured: product?.is_featured ?? false,
    is_new: product?.is_new ?? isNew,
    is_sale: product?.is_sale ?? false,
  });
  const [sortOrder, setSortOrder] = useState(String(product?.sort_order ?? 0));
  const [metaTitle, setMetaTitle] = useState(product?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product?.meta_description ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const payload = {
      name,
      slug: effectiveSlug,
      category_id: categoryId,
      brand_id: brandId || null,
      sku,
      price,
      old_price: oldPrice,
      wholesale_prices: tiers.map((t) => ({ min_qty: Number(t.min_qty), price: Number(t.price) })),
      images: images.map((img) => ({ ...img, alt: img.alt || name })),
      specs,
      description,
      ...flags,
      sort_order: sortOrder,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };
    try {
      if (isNew) {
        const { id } = await adminRequest<{ id: string }>("/api/admin/products", "POST", payload);
        router.replace(`/admin/products/${id}?created=1`);
      } else {
        await adminRequest(`/api/admin/products/${product.id}`, "PATCH", payload);
        setSaved(true);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product || !confirm(`Удалить «${product.name}»? Это нельзя отменить. Чтобы убрать товар временно, снимите галочку «Показывать на сайте».`)) return;
    try {
      await adminRequest(`/api/admin/products/${product.id}`, "DELETE");
      router.replace("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  }

  const basePrice = Number(price) || 0;

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-5">
        <Card title="Основное">
          <Field label="Название *">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={200} placeholder="Подвесной унитаз безободковый" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Категория *">
              <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Бренд">
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="field">
                <option value="">Без бренда</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Артикул">
              <input value={sku} onChange={(e) => setSku(e.target.value)} className="field font-mono" maxLength={60} />
            </Field>
          </div>
          <Field label="Описание" hint="Абзацы разделяйте пустой строкой. Уникальный текст помогает в поиске Google и Яндекса.">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="field resize-y" />
          </Field>
        </Card>

        <Card title="Фото">
          <ImageUploader value={images} onChange={setImages} folder="products" />
        </Card>

        <Card title="Цены">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Розничная цена, ₸ *">
              <input required inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className="field font-mono" />
            </Field>
            <Field label="Старая цена, ₸" hint="Показывается зачёркнутой, если выше розничной">
              <input inputMode="numeric" value={oldPrice} onChange={(e) => setOldPrice(e.target.value.replace(/\D/g, ""))} className="field font-mono" />
            </Field>
          </div>
          <div>
            <p className="label">Оптовые цены</p>
            <p className="mb-3 text-xs text-chrome">Цена за штуку при заказе от указанного количества. Каждая следующая ступень — дешевле.</p>
            <ul className="space-y-2">
              {tiers.map((t, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-ink-soft">от</span>
                  <input inputMode="numeric" value={t.min_qty} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, min_qty: e.target.value.replace(/\D/g, "") } : x)))} className="field !w-24 font-mono" aria-label="Количество от" />
                  <span className="text-sm text-ink-soft">шт —</span>
                  <input inputMode="numeric" value={t.price} onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, "") } : x)))} className="field !w-36 font-mono" aria-label="Цена за штуку" />
                  <span className="text-sm text-ink-soft">₸</span>
                  {basePrice > 0 && Number(t.price) > 0 && (
                    <span className="font-mono text-xs text-brass">−{Math.round((1 - Number(t.price) / basePrice) * 100)}%</span>
                  )}
                  <button type="button" onClick={() => setTiers(tiers.filter((_, j) => j !== i))} className="ml-auto text-sm text-danger hover:underline">Убрать</button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 50, 100].filter((n) => !tiers.some((t) => Number(t.min_qty) === n)).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTiers([...tiers, { min_qty: String(n), price: basePrice ? String(Math.round(basePrice * (n >= 100 ? 0.85 : n >= 50 ? 0.9 : 0.95))) : "" }])}
                  className="btn btn-ghost btn-sm"
                >
                  + от {n} шт
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Характеристики">
          <ul className="space-y-2">
            {specs.map((s, i) => (
              <li key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <input value={s.label} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Параметр" className="field" list="spec-presets" aria-label="Параметр" />
                <input value={s.value} onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="1700 × 700 мм" className="field" aria-label="Значение" />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="px-2 text-sm text-danger" aria-label="Удалить характеристику">✕</button>
              </li>
            ))}
          </ul>
          <datalist id="spec-presets">{SPEC_PRESETS.map((p) => <option key={p} value={p} />)}</datalist>
          <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="btn btn-ghost btn-sm">+ Характеристика</button>
          <p className="text-xs text-chrome">«Размер», «Диаметр» или «Ширина» показываются размерной линией на карточке товара.</p>
        </Card>

        <Card title="SEO">
          <Field label="Адрес страницы" hint={`sanlux.kz/product/${effectiveSlug || "…"}`}>
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
              className="field font-mono"
            />
          </Field>
          <Field label="Title" hint={`Если пусто: «${name || "Название"} — купить в Астане за ${basePrice ? formatPrice(basePrice) : "…"} | SanLux». ${metaTitle.length}/70`}>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="field" maxLength={160} />
          </Field>
          <Field label="Description" hint={`Если пусто — соберётся из цены и описания. ${metaDescription.length}/160`}>
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="field resize-y" maxLength={320} />
          </Field>
        </Card>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20">
        <Card title="Публикация">
          <Toggle label="Показывать на сайте" checked={flags.is_published} onChange={(v) => setFlags({ ...flags, is_published: v })} />
          <Toggle label="В наличии" checked={flags.in_stock} onChange={(v) => setFlags({ ...flags, in_stock: v })} />
          <Toggle label="Хит продаж (на главной)" checked={flags.is_featured} onChange={(v) => setFlags({ ...flags, is_featured: v })} />
          <Toggle label="Новинка" checked={flags.is_new} onChange={(v) => setFlags({ ...flags, is_new: v })} />
          <Toggle label="Акция" checked={flags.is_sale} onChange={(v) => setFlags({ ...flags, is_sale: v })} />
          <Field label="Порядок сортировки" hint="Больше — выше в списке">
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="field font-mono" />
          </Field>
        </Card>
        <div className="space-y-2">
          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            {saving ? "Сохраняем…" : isNew ? "Создать товар" : "Сохранить изменения"}
          </button>
          {saved && <p className="text-center text-sm text-success" role="status">Изменения сохранены и уже на сайте</p>}
          {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
          {product && (
            <div className="flex justify-between pt-2 text-sm">
              <Link href={`/product/${product.slug}`} target="_blank" className="text-cobalt hover:underline">Открыть на сайте ↗</Link>
              <button type="button" onClick={remove} className="text-danger hover:underline">Удалить товар</button>
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
