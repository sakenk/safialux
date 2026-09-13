import type { Metadata } from "next";
import CatalogView from "@/components/catalog/CatalogView";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = parseCatalogParams(await searchParams);
  return pageMetadata({
    title: params.q
      ? `Поиск «${params.q}» — каталог сантехники | ${SITE.name}`
      : `Каталог сантехники в Астане — цены, опт и розница | ${SITE.name}`,
    description:
      "Каталог сантехники SanLux: ванны, раковины, унитазы, смесители и инсталляции. Цены в тенге, оптовые скидки от 10 штук, доставка по Казахстану.",
    path: params.page > 1 && !params.hasFilters ? `/catalog?page=${params.page}` : "/catalog",
    noindex: params.hasFilters,
  });
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = parseCatalogParams(await searchParams);
  return (
    <CatalogView
      basePath="/catalog"
      params={params}
      scope={{}}
      title={params.q ? `Поиск: «${params.q}»` : "Каталог сантехники"}
      intro={params.q ? null : "Все товары магазина с ценами в тенге. Для заказов от 10 штук цена за единицу снижается автоматически."}
      breadcrumbs={[
        { name: "Главная", path: "/" },
        { name: "Каталог", path: "/catalog" },
      ]}
    />
  );
}
