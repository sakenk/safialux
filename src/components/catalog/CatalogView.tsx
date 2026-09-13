import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { getBrands, queryCatalog, SORTS, type CatalogQuery } from "@/lib/data";
import { buildHref, toQuery, type ParsedCatalogParams } from "@/lib/catalog-params";
import { formatNumber } from "@/lib/pricing";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { pluralRu } from "@/lib/text";
import ProductCard from "./ProductCard";
import FilterForm from "./FilterForm";

export default async function CatalogView({
  basePath,
  params,
  scope,
  title,
  intro,
  seoText,
  breadcrumbs,
  lockBrand = false,
}: {
  basePath: string;
  params: ParsedCatalogParams;
  scope: Partial<CatalogQuery>;
  title: string;
  intro?: string | null;
  seoText?: string | null;
  breadcrumbs: { name: string; path: string }[];
  lockBrand?: boolean;
}) {
  const brands = await getBrands();
  const brandIdBySlug = new Map(brands.map((b) => [b.slug, b.id]));
  const result = await queryCatalog(toQuery(params, brandIdBySlug, scope));
  const { items, total, page, pageCount, facets } = result;

  return (
    <div className="container-x pb-16 pt-6 md:pb-24">
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs), itemListJsonLd(items)]} />
      <nav aria-label="Хлебные крошки" className="mb-5 text-sm text-chrome">
        <ol className="flex flex-wrap items-center gap-1.5">
          {breadcrumbs.map((b, i) => (
            <li key={b.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i < breadcrumbs.length - 1 ? (
                <Link href={b.path} className="hover:text-ink">{b.name}</Link>
              ) : (
                <span className="text-ink-soft" aria-current="page">{b.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mb-8 flex flex-col gap-3 border-b border-grout pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold sm:text-[2.6rem]">{title}</h1>
          {intro && <p className="mt-3 text-[17px] text-ink-soft">{intro}</p>}
        </div>
        <p className="font-mono text-sm text-chrome">
          {formatNumber(total)} {pluralRu(total, ["товар", "товара", "товаров"])}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside>
          <FilterForm
            basePath={basePath}
            params={params}
            brands={lockBrand ? [] : facets.brands}
            priceRange={facets.priceRange}
            sorts={SORTS}
          />
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-grout bg-porcelain p-10 text-center">
              <p className="font-display text-xl">Ничего не нашлось</p>
              <p className="mx-auto mt-2 max-w-md text-ink-soft">
                Измените фильтры или напишите нам — подберём модель под заказ, даже если её нет в каталоге.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href={basePath} className="btn btn-ghost btn-sm">Сбросить фильтры</Link>
                <Link href="/#podbor" className="btn btn-primary btn-sm">Помощь с выбором</Link>
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {items.map((p, i) => (
                <li key={p.id} className="flex"><ProductCard product={p} priority={i < 3} /></li>
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <nav aria-label="Страницы каталога" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={buildHref(basePath, params, { page: n })}
                  aria-current={n === page ? "page" : undefined}
                  className={`grid size-11 place-items-center rounded-full border font-mono text-sm ${
                    n === page ? "border-ink bg-ink text-white" : "border-grout bg-porcelain hover:border-ink"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}

          {seoText && page === 1 && !params.hasFilters && (
            <section className="prose-seo mt-14 max-w-3xl border-t border-grout pt-8 text-ink-soft">
              {seoText.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
