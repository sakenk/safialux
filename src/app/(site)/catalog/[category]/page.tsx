import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/catalog/CatalogView";
import { getCategoryBySlug, getCategoryStats } from "@/lib/data";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { formatPrice } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const query = parseCatalogParams(await searchParams);
  const stats = (await getCategoryStats()).get(category.id);
  const fromPrice = stats ? ` от ${formatPrice(stats.minPrice)}` : "";

  return pageMetadata({
    title: category.seo_title || `${category.name} в Астане — купить${fromPrice}, опт и розница | ${SITE.name}`,
    description:
      category.seo_description ||
      `${category.name} в Астане${fromPrice}. ${category.description ?? ""} Оптовые цены от 10 штук, доставка по Казахстану.`.trim(),
    path:
      query.page > 1 && !query.hasFilters ? `/catalog/${category.slug}?page=${query.page}` : `/catalog/${category.slug}`,
    image: category.image_url,
    noindex: query.hasFilters,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const query = parseCatalogParams(await searchParams);

  return (
    <CatalogView
      basePath={`/catalog/${category.slug}`}
      params={query}
      scope={{ categoryId: category.id }}
      title={category.h1 || category.name}
      intro={category.description}
      seoText={category.seo_text}
      breadcrumbs={[
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
        { name: category.name, path: `/catalog/${category.slug}` },
      ]}
    />
  );
}
