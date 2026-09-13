import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogView from "@/components/catalog/CatalogView";
import { getBrandBySlug } from "@/lib/data";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  const query = parseCatalogParams(await searchParams);
  return pageMetadata({
    title: brand.seo_title || `${brand.name} в Астане — сантехника ${brand.name} по цене дилера | ${SITE.name}`,
    description:
      brand.seo_description ||
      `Купить сантехнику ${brand.name} в Астане: наличие, цены в тенге, оптовые скидки для застройщиков и доставка по Казахстану.`,
    path: `/brand/${brand.slug}`,
    image: brand.logo_url,
    noindex: query.hasFilters,
  });
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const query = parseCatalogParams(await searchParams);

  return (
    <CatalogView
      basePath={`/brand/${brand.slug}`}
      params={{ ...query, brandSlugs: [] }}
      scope={{ brandIds: [brand.id] }}
      lockBrand
      title={brand.h1 || `Сантехника ${brand.name}`}
      intro={brand.description || `Товары ${brand.name} в наличии и под заказ. Оптовые цены — от 10 штук.`}
      seoText={brand.seo_text}
      breadcrumbs={[
        { name: "Главная", path: "/" },
        { name: "Бренды", path: "/brands" },
        { name: brand.name, path: `/brand/${brand.slug}` },
      ]}
    />
  );
}
