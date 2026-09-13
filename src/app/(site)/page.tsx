import JsonLd from "@/components/JsonLd";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/catalog/ProductCard";
import Hero from "@/components/home/Hero";
import CategoryTiles from "@/components/home/CategoryTiles";
import WholesaleBand from "@/components/home/WholesaleBand";
import ContactsBlock from "@/components/home/ContactsBlock";
import { BrandsMarquee, Faq, Reasons, Steps } from "@/components/home/InfoSections";
import LeadForm from "@/components/forms/LeadForm";
import { getBrands, getCategories, getCategoryStats, getFeaturedProducts } from "@/lib/data";
import { FAQ } from "@/lib/content";
import { faqJsonLd } from "@/lib/seo";
import { sortedTiers } from "@/lib/pricing";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, brands, stats, featured] = await Promise.all([
    getCategories(),
    getBrands(),
    getCategoryStats(),
    getFeaturedProducts(8),
  ]);

  const sampleProduct =
    featured.find((p) => sortedTiers(p.wholesale_prices).length >= 2) ??
    featured.find((p) => sortedTiers(p.wholesale_prices).length > 0);

  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <Hero />

      <section className="container-x py-14 md:py-20">
        <SectionHeader
          eyebrow="Каталог"
          title="Сантехника для ванной комнаты"
          link={{ href: "/catalog", label: "Весь каталог" }}
        />
        <CategoryTiles categories={categories} stats={stats} />
      </section>

      {featured.length > 0 && (
        <section className="container-x pb-14 md:pb-20">
          <SectionHeader
            eyebrow="Популярное"
            title="Хиты продаж"
            lead="Модели, которые чаще всего берут в квартиры и на объекты."
            link={{ href: "/catalog", label: "Смотреть все товары" }}
          />
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id} className="flex"><ProductCard product={p} /></li>
            ))}
          </ul>
        </section>
      )}

      <WholesaleBand
        sample={
          sampleProduct
            ? {
                name: sampleProduct.name,
                slug: sampleProduct.slug,
                price: sampleProduct.price,
                tiers: sortedTiers(sampleProduct.wholesale_prices),
              }
            : null
        }
      />

      <Reasons />
      <Steps />
      <BrandsMarquee brands={brands} />

      <section className="container-x grid gap-10 pb-14 md:pb-20 lg:grid-cols-2 lg:gap-16">
        <div className="rounded-[28px] border border-grout bg-porcelain p-6 sm:p-9" id="podbor">
          <p className="eyebrow mb-3">Бесплатно</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Помощь с выбором сантехники</h2>
          <p className="mb-6 mt-3 text-ink-soft">
            Оставьте телефон — специалист перезвонит, подберёт модели под размеры и бюджет и подготовит предложение в течение 24 часов.
          </p>
          <LeadForm source="home-podbor" withMessage messagePlaceholder="Например: унитаз подвесной с инсталляцией, санузел 1,5 × 1,7 м" />
        </div>
        <div>
          <p className="eyebrow mb-3">Вопросы</p>
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Частые вопросы о покупке</h2>
          <Faq />
        </div>
      </section>

      <section className="container-x pb-16 md:pb-24">
        <ContactsBlock />
      </section>
    </>
  );
}
