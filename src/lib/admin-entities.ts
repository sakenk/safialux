import "server-only";
import { isValidSlug, slugify } from "./text";
import type { PriceTier, ProductImage, ProductSpec } from "./types";

// Валидация данных из форм админки. Возвращает либо чистый объект для БД, либо текст ошибки.

export type EntityName = "products" | "categories" | "brands" | "orders" | "leads";
export const CATALOG_ENTITIES: EntityName[] = ["products", "categories", "brands"];

type Result = { data: Record<string, unknown> } | { error: string };
type Input = Record<string, unknown>;

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const optStr = (v: unknown, max = 500) => str(v, max) || null;
const bool = (v: unknown) => v === true || v === "true" || v === "on" || v === 1;
const int = (v: unknown, fallback = 0) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : fallback;
};
const money = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Math.round(Number(String(v).replace(/[^\d.]/g, "")));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const isUrlOrPath = (u: string) => /^https:\/\/res\.cloudinary\.com\//.test(u) || /^\/[\w\-./]+$/.test(u) || /^https:\/\//.test(u);

function slugFrom(input: Input, fallbackName: string): string | { error: string } {
  const slug = str(input.slug, 90) || slugify(fallbackName);
  if (!isValidSlug(slug)) return { error: "Адрес страницы (slug): только латиница, цифры и дефис" };
  return slug;
}

function seo(input: Input) {
  return {
    h1: optStr(input.h1, 160),
    seo_title: optStr(input.seo_title, 160),
    seo_description: optStr(input.seo_description, 320),
    seo_text: optStr(input.seo_text, 20000),
  };
}

export function sanitizeCategory(input: Input): Result {
  const name = str(input.name, 80);
  if (!name) return { error: "Укажите название категории" };
  const slug = slugFrom(input, name);
  if (typeof slug !== "string") return slug;
  const image = str(input.image_url, 600);
  return {
    data: {
      name,
      slug,
      description: optStr(input.description, 600),
      image_url: image && isUrlOrPath(image) ? image : null,
      sort_order: int(input.sort_order),
      is_published: bool(input.is_published),
      ...seo(input),
    },
  };
}

export function sanitizeBrand(input: Input): Result {
  const name = str(input.name, 80);
  if (!name) return { error: "Укажите название бренда" };
  const slug = slugFrom(input, name);
  if (typeof slug !== "string") return slug;
  const logo = str(input.logo_url, 600);
  return {
    data: {
      name,
      slug,
      description: optStr(input.description, 2000),
      logo_url: logo && isUrlOrPath(logo) ? logo : null,
      country: optStr(input.country, 60),
      sort_order: int(input.sort_order),
      is_published: bool(input.is_published),
      ...seo(input),
    },
  };
}

export function sanitizeProduct(input: Input): Result {
  const name = str(input.name, 200);
  if (!name) return { error: "Укажите название товара" };
  const categoryId = str(input.category_id, 40);
  if (!categoryId) return { error: "Выберите категорию" };
  const slug = slugFrom(input, name);
  if (typeof slug !== "string") return slug;
  const price = money(input.price);
  if (price === null || price <= 0) return { error: "Укажите цену больше нуля" };
  const oldPrice = money(input.old_price);

  const images: ProductImage[] = (Array.isArray(input.images) ? input.images : [])
    .map((img) => ({ url: str((img as Input)?.url, 600), alt: str((img as Input)?.alt, 200) || undefined }))
    .filter((img) => img.url && isUrlOrPath(img.url))
    .slice(0, 20);

  const specs: ProductSpec[] = (Array.isArray(input.specs) ? input.specs : [])
    .map((s) => ({ label: str((s as Input)?.label, 80), value: str((s as Input)?.value, 200) }))
    .filter((s) => s.label && s.value)
    .slice(0, 40);

  const tierMap = new Map<number, number>();
  for (const t of Array.isArray(input.wholesale_prices) ? input.wholesale_prices : []) {
    const minQty = int((t as Input)?.min_qty);
    const tierPrice = money((t as Input)?.price);
    if (minQty > 1 && tierPrice && tierPrice > 0) tierMap.set(minQty, tierPrice);
  }
  const tiers: PriceTier[] = [...tierMap.entries()]
    .map(([min_qty, p]) => ({ min_qty, price: p }))
    .sort((a, b) => a.min_qty - b.min_qty);
  for (let i = 0; i < tiers.length; i++) {
    const prev = i === 0 ? price : tiers[i - 1].price;
    if (tiers[i].price >= prev) {
      return { error: `Оптовая цена от ${tiers[i].min_qty} шт должна быть ниже предыдущей ступени (${prev} ₸)` };
    }
  }

  return {
    data: {
      name,
      slug,
      category_id: categoryId,
      brand_id: optStr(input.brand_id, 40),
      sku: optStr(input.sku, 60),
      description: optStr(input.description, 20000),
      price,
      old_price: oldPrice && oldPrice > price ? oldPrice : null,
      wholesale_prices: tiers,
      images,
      specs,
      in_stock: bool(input.in_stock),
      is_featured: bool(input.is_featured),
      is_new: bool(input.is_new),
      is_sale: bool(input.is_sale),
      is_published: bool(input.is_published),
      sort_order: int(input.sort_order),
      meta_title: optStr(input.meta_title, 160),
      meta_description: optStr(input.meta_description, 320),
    },
  };
}

const ORDER_STATUSES = ["new", "processing", "done", "cancelled"];
const LEAD_STATUSES = ["new", "in_work", "closed"];

export function sanitizeOrderPatch(input: Input): Result {
  const data: Record<string, unknown> = {};
  if (input.status !== undefined) {
    if (!ORDER_STATUSES.includes(String(input.status))) return { error: "Неизвестный статус заказа" };
    data.status = input.status;
  }
  if (input.admin_note !== undefined) data.admin_note = optStr(input.admin_note, 4000);
  return Object.keys(data).length ? { data } : { error: "Нечего сохранять" };
}

export function sanitizeLeadPatch(input: Input): Result {
  if (!LEAD_STATUSES.includes(String(input.status))) return { error: "Неизвестный статус заявки" };
  return { data: { status: input.status } };
}

/** Точечные правки из таблицы товаров (флаги и порядок) без полной формы. */
export function sanitizeProductQuickPatch(input: Input): Result | null {
  const allowed = ["is_published", "is_featured", "is_new", "is_sale", "in_stock", "sort_order"];
  const keys = Object.keys(input);
  if (!keys.length || !keys.every((k) => allowed.includes(k))) return null;
  const data: Record<string, unknown> = {};
  for (const k of keys) data[k] = k === "sort_order" ? int(input[k]) : bool(input[k]);
  return { data };
}

export function sanitize(entity: EntityName, input: Input, mode: "create" | "update"): Result {
  switch (entity) {
    case "categories": return sanitizeCategory(input);
    case "brands": return sanitizeBrand(input);
    case "products":
      if (mode === "update") {
        const quick = sanitizeProductQuickPatch(input);
        if (quick) return quick;
      }
      return sanitizeProduct(input);
    case "orders": return mode === "update" ? sanitizeOrderPatch(input) : { error: "Заказы создаются только с сайта" };
    case "leads": return mode === "update" ? sanitizeLeadPatch(input) : { error: "Заявки создаются только с сайта" };
  }
}

export function isEntity(value: string): value is EntityName {
  return ["products", "categories", "brands", "orders", "leads"].includes(value);
}

export function friendlyDbError(message: string) {
  if (/duplicate key.*slug/i.test(message)) return "Такой адрес страницы (slug) уже занят — измените его";
  if (/violates foreign key.*products_category_id/i.test(message)) return "В категории есть товары — перенесите их или скройте категорию";
  if (/violates foreign key/i.test(message)) return "Запись связана с другими данными и не может быть удалена";
  return "Не удалось сохранить: " + message;
}
