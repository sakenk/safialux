import { SORTS, type CatalogQuery, type SortKey } from "./data";

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseCatalogParams(sp: SearchParams) {
  const brandSlugs = ([] as string[]).concat(sp.brand ?? []).filter(Boolean);
  const sortRaw = first(sp.sort);
  const sort: SortKey = sortRaw && sortRaw in SORTS ? (sortRaw as SortKey) : "popular";
  const parsed = {
    q: first(sp.q)?.slice(0, 80) || undefined,
    brandSlugs,
    minPrice: num(first(sp.min)),
    maxPrice: num(first(sp.max)),
    inStock: first(sp.stock) === "1",
    sale: first(sp.sale) === "1",
    sort,
    page: num(first(sp.page)) ?? 1,
  };
  const hasFilters = Boolean(
    parsed.q || brandSlugs.length || parsed.minPrice || parsed.maxPrice || parsed.inStock || parsed.sale || sort !== "popular",
  );
  return { ...parsed, hasFilters };
}

export type ParsedCatalogParams = ReturnType<typeof parseCatalogParams>;

export function toQuery(
  params: ParsedCatalogParams,
  brandIdBySlug: Map<string, string>,
  extra: Partial<CatalogQuery>,
): CatalogQuery {
  return {
    q: params.q,
    brandIds: params.brandSlugs.map((s) => brandIdBySlug.get(s)).filter((id): id is string => Boolean(id)),
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStock: params.inStock,
    sale: params.sale,
    sort: params.sort,
    page: params.page,
    ...extra,
  };
}

export function buildHref(basePath: string, params: ParsedCatalogParams, override: Partial<ParsedCatalogParams>) {
  const p = { ...params, ...override };
  const usp = new URLSearchParams();
  if (p.q) usp.set("q", p.q);
  p.brandSlugs.forEach((b) => usp.append("brand", b));
  if (p.minPrice) usp.set("min", String(p.minPrice));
  if (p.maxPrice) usp.set("max", String(p.maxPrice));
  if (p.inStock) usp.set("stock", "1");
  if (p.sale) usp.set("sale", "1");
  if (p.sort !== "popular") usp.set("sort", p.sort);
  if (p.page > 1) usp.set("page", String(p.page));
  const qs = usp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
