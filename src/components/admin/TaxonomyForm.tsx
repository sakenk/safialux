"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/text";
import type { Brand, Category } from "@/lib/types";
import { adminRequest } from "./api";
import { Card, Field, Toggle } from "./FormParts";
import ImageUploader from "./ImageUploader";

type Kind = "categories" | "brands";

const COPY: Record<Kind, { one: string; publicPath: string; imageLabel: string; seoExample: string }> = {
  categories: { one: "категорию", publicPath: "/catalog/", imageLabel: "Фото для плитки на главной", seoExample: "Унитазы в Астане" },
  brands: { one: "бренд", publicPath: "/brand/", imageLabel: "Логотип", seoExample: "Сантехника Grohe" },
};

export default function TaxonomyForm({ kind, item }: { kind: Kind; item?: Category | Brand }) {
  const router = useRouter();
  const copy = COPY[kind];
  const isNew = !item;
  const imageUrl = item ? ("image_url" in item ? item.image_url : item.logo_url) : null;

  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const [description, setDescription] = useState(item?.description ?? "");
  const [country, setCountry] = useState(item && "country" in item ? (item.country ?? "") : "");
  const [image, setImage] = useState(imageUrl ? [{ url: imageUrl }] : []);
  const [sortOrder, setSortOrder] = useState(String(item?.sort_order ?? 0));
  const [published, setPublished] = useState(item?.is_published ?? true);
  const [seo, setSeo] = useState({
    h1: item?.h1 ?? "",
    seo_title: item?.seo_title ?? "",
    seo_description: item?.seo_description ?? "",
    seo_text: item?.seo_text ?? "",
  });
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
      description,
      [kind === "categories" ? "image_url" : "logo_url"]: image[0]?.url ?? "",
      ...(kind === "brands" ? { country } : {}),
      sort_order: sortOrder,
      is_published: published,
      ...seo,
    };
    try {
      if (isNew) {
        await adminRequest(`/api/admin/${kind}`, "POST", payload);
        router.replace(`/admin/${kind}`);
        router.refresh();
      } else {
        await adminRequest(`/api/admin/${kind}/${item.id}`, "PATCH", payload);
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
    if (!item || !confirm(`Удалить «${item.name}»? Чтобы убрать временно, снимите «Показывать на сайте».`)) return;
    try {
      await adminRequest(`/api/admin/${kind}/${item.id}`, "DELETE");
      router.replace(`/admin/${kind}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-5">
        <Card title="Основное">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Название *">
              <input required value={name} onChange={(e) => setName(e.target.value)} className="field" maxLength={80} />
            </Field>
            <Field label="Адрес страницы" hint={`sanlux.kz${copy.publicPath}${effectiveSlug || "…"}`}>
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                className="field font-mono"
              />
            </Field>
          </div>
          {kind === "brands" && (
            <Field label="Страна производителя">
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="field" maxLength={60} placeholder="Германия" />
            </Field>
          )}
          <Field label="Краткое описание" hint="Показывается под заголовком страницы">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="field resize-y" />
          </Field>
        </Card>

        <Card title={copy.imageLabel}>
          <ImageUploader value={image} onChange={setImage} folder={kind} multiple={false} />
        </Card>

        <Card title="SEO">
          <Field label="Заголовок H1" hint={`Например: «${copy.seoExample}». Если пусто — название.`}>
            <input value={seo.h1} onChange={(e) => setSeo({ ...seo, h1: e.target.value })} className="field" maxLength={160} />
          </Field>
          <Field label="Title" hint={`${seo.seo_title.length}/70 символов`}>
            <input value={seo.seo_title} onChange={(e) => setSeo({ ...seo, seo_title: e.target.value })} className="field" maxLength={160} />
          </Field>
          <Field label="Description" hint={`${seo.seo_description.length}/160 символов`}>
            <textarea value={seo.seo_description} onChange={(e) => setSeo({ ...seo, seo_description: e.target.value })} rows={2} className="field resize-y" maxLength={320} />
          </Field>
          <Field label="SEO-текст под товарами" hint="2–4 абзаца уникального текста о разделе. Абзацы разделяйте пустой строкой.">
            <textarea value={seo.seo_text} onChange={(e) => setSeo({ ...seo, seo_text: e.target.value })} rows={8} className="field resize-y" />
          </Field>
        </Card>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20">
        <Card title="Публикация">
          <Toggle label="Показывать на сайте" checked={published} onChange={setPublished} />
          <Field label="Порядок" hint="Меньше — раньше в меню">
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="field font-mono" />
          </Field>
        </Card>
        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saving ? "Сохраняем…" : isNew ? `Создать ${copy.one}` : "Сохранить изменения"}
        </button>
        {saved && <p className="text-center text-sm text-success" role="status">Сохранено</p>}
        {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        {item && (
          <div className="flex justify-between text-sm">
            <Link href={`${copy.publicPath}${item.slug}`} target="_blank" className="text-cobalt hover:underline">Открыть на сайте ↗</Link>
            <button type="button" onClick={remove} className="text-danger hover:underline">Удалить</button>
          </div>
        )}
      </aside>
    </form>
  );
}
