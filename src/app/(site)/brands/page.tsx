import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { getBrandProductCount, getBrands } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { pluralRu } from "@/lib/text";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: `Бренды сантехники — Grohe, AM.PM, Cersanit и другие | ${SITE.name}`,
  description: "Производители сантехники, которых мы продаём в Астане: Grohe, Gappo, Saniteco, Triton, Cersanit, AM.PM, Lusso, Santek и другие.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getBrands();
  const counts = await Promise.all(brands.map((b) => getBrandProductCount(b.id)));

  return (
    <div className="container-x pb-20 pt-10">
      <SectionHeader
        as="h1"
        eyebrow="Производители"
        title="Бренды сантехники"
        lead="Работаем с производителями напрямую и через официальных дистрибьюторов — поэтому гарантия действует у каждого товара."
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b, i) => (
          <li key={b.id}>
            <Link href={`/brand/${b.slug}`} className="group flex h-full flex-col rounded-[var(--radius-card)] border border-grout bg-porcelain p-5 transition-shadow hover:shadow-lift">
              <div className="grid h-24 place-items-center">
                {b.logo_url ? (
                  <Image src={b.logo_url} alt={b.name} width={160} height={80} className="max-h-16 w-auto object-contain mix-blend-multiply" />
                ) : (
                  <span className="font-display text-xl">{b.name}</span>
                )}
              </div>
              <p className="mt-3 font-medium group-hover:text-cobalt">{b.name}</p>
              <p className="font-mono text-xs text-chrome">
                {counts[i]} {pluralRu(counts[i], ["товар", "товара", "товаров"])}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
