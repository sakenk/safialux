import "server-only";
import { unstable_cache } from "next/cache";
import { publicDb, isSupabaseConfigured } from "./supabase";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import type { Brand, Category, Product, ProductWithRelations } from "./types";

export const CATALOG_TAG = "catalog";
const REVALIDATE_SECONDS = 3600;

export const isDemoMode = !isSupabaseConfigured;

function cached<T>(key: string, fn: () => Promise<T>) {
  return unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: REVALIDATE_SECONDS });
}

async function selectAll<T>(table: string, order: string): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await publicDb()
      .from(table)
      .select("*")
      .order(order, { ascending: order === "sort_order" })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < pageSize) return rows;
  }
}

const normalizeProduct = (p: Product): Product => ({
  ...p,
  price: Number(p.price),
  old_price: p.old_price == null ? null : Number(p.old_price),
  wholesale_prices: Array.isArray(p.wholesale_prices) ? p.wholesale_prices : [],
  images: Array.isArray(p.images) ? p.images : [],
  specs: Array.isArray(p.specs) ? p.specs : [],
});

export const getCategories = cached("categories", async (): Promise<Category[]> => {
  if (isDemoMode) return DEMO_CATEGORIES;
  return selectAll<Category>("categories", "sort_order");
});

export const getBrands = cached("brands", async (): Promise<Brand[]> => {
  if (isDemoMode) return DEMO_BRANDS;
  return selectAll<Brand>("brands", "sort_order");
});

const getAllProducts = cached("products", async (): Promise<Product[]> => {
  const rows = isDemoMode ? DEMO_PRODUCTS : await selectAll<Product>("products", "created_at");
  return rows.map(normalizeProduct);
});

async function withRelations(products: Product[]): Promise<ProductWithRelations[]> {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  return products.map((p) => {
    const c = catMap.get(p.category_id);
    const b = p.brand_id ? brandMap.get(p.brand_id) : undefined;
    return {
      ...p,
      category: c ? { id: c.id, slug: c.slug, name: c.name } : null,
      brand: b ? { id: b.id, slug: b.slug, name: b.name, logo_url: b.logo_url } : null,
    };
  });
}

/** Товары видимы, только если опубликована и их категория. */
async function visibleProducts() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const visibleCats = new Set(categories.map((c) => c.id));
  return products.filter((p) => visibleCats.has(p.category_id));
}

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getBrandBySlug(slug: string) {
  return (await getBrands()).find((b) => b.slug === slug) ?? null;
}

export const SORTS = {
  popular: "Сначала популярные",
  "price-asc": "Сначала дешевле",
  "price-desc": "Сначала дороже",
  new: "Новинки",
} as const;
export type SortKey = keyof typeof SORTS;

export interface CatalogQuery {
  categoryId?: string;
  brandIds?: string[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sale?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface CatalogFacets {
  brands: { id: string; slug: string; name: string; count: number }[];
  priceRange: [number, number];
}

export async function queryCatalog(query: CatalogQuery) {
  const perPage = query.perPage ?? 24;
  const page = Math.max(1, query.page ?? 1);
  const all = await visibleProducts();

  // Фасеты считаются по категории/поиску, но до фильтров по бренду и цене — чтобы их можно было менять.
  const q = query.q?.trim().toLowerCase();
  const base = all.filter(
    (p) =>
      (!query.categoryId || p.category_id === query.categoryId) &&
      (!q || `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(q)),
  );

  const brands = await getBrands();
  const brandCounts = new Map<string, number>();
  for (const p of base) if (p.brand_id) brandCounts.set(p.brand_id, (brandCounts.get(p.brand_id) ?? 0) + 1);
  const prices = base.map((p) => p.price);
  const facets: CatalogFacets = {
    brands: brands
      .filter((b) => brandCounts.has(b.id))
      .map((b) => ({ id: b.id, slug: b.slug, name: b.name, count: brandCounts.get(b.id)! })),
    priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
  };

  const brandSet = query.brandIds?.length ? new Set(query.brandIds) : null;
  const filtered = base.filter(
    (p) =>
      (!brandSet || (p.brand_id && brandSet.has(p.brand_id))) &&
      (query.minPrice == null || p.price >= query.minPrice) &&
      (query.maxPrice == null || p.price <= query.maxPrice) &&
      (!query.inStock || p.in_stock) &&
      (!query.sale || p.is_sale || (p.old_price != null && p.old_price > p.price)),
  );

  const sort = query.sort ?? "popular";
  filtered.sort((a, b) => {
    if (a.in_stock !== b.in_stock) return a.in_stock ? -1 : 1;
    switch (sort) {
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "new": return b.created_at.localeCompare(a.created_at);
      default:
        return (
          Number(b.is_featured) - Number(a.is_featured) ||
          b.sort_order - a.sort_order ||
          b.created_at.localeCompare(a.created_at)
        );
    }
  });

  const total = filtered.length;
  const items = await withRelations(filtered.slice((page - 1) * perPage, page * perPage));
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / perPage)), facets };
}

export async function getFeaturedProducts(limit = 8) {
  const all = await visibleProducts();
  const featured = all
    .filter((p) => p.is_featured)
    .sort((a, b) => b.sort_order - a.sort_order);
  const rest = all
    .filter((p) => !p.is_featured)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return withRelations([...featured, ...rest].slice(0, limit));
}

export async function getProductBySlug(slug: string) {
  const product = (await visibleProducts()).find((p) => p.slug === slug);
  if (!product) return null;
  const [withRel] = await withRelations([product]);
  return withRel;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const all = await visibleProducts();
  return withRelations(
    all
      .filter((p) => p.id !== product.id && p.category_id === product.category_id)
      .sort((a, b) => Number(b.in_stock) - Number(a.in_stock) || b.sort_order - a.sort_order)
      .slice(0, limit),
  );
}

export async function getCategoryStats() {
  const all = await visibleProducts();
  const stats = new Map<string, { count: number; minPrice: number }>();
  for (const p of all) {
    const s = stats.get(p.category_id);
    if (s) {
      s.count += 1;
      s.minPrice = Math.min(s.minPrice, p.price);
    } else {
      stats.set(p.category_id, { count: 1, minPrice: p.price });
    }
  }
  return stats;
}

/** Для заказов: только опубликованные товары, цены — актуальные из каталога. */
export async function getOrderableProducts(ids: string[]) {
  const wanted = new Set(ids);
  return (await visibleProducts()).filter((p) => wanted.has(p.id));
}

export async function getBrandProductCount(brandId: string) {
  return (await visibleProducts()).filter((p) => p.brand_id === brandId).length;
}

export async function getSitemapEntries() {
  const [categories, brands, products] = await Promise.all([getCategories(), getBrands(), visibleProducts()]);
  return { categories, brands, products };
}
