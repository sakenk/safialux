import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/catalog/ProductCard";
import LeadForm from "@/components/forms/LeadForm";
import BuyBox from "@/components/product/BuyBox";
import Gallery from "@/components/product/Gallery";
import { getProductBySlug, getRelatedProducts, getSitemapEntries } from "@/lib/data";
import { formatPrice } from "@/lib/pricing";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { truncate } from "@/lib/text";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { products } = await getSitemapEntries();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const title = p.meta_title || `${p.name}${p.brand ? ` ${p.brand.name}` : ""} — купить в Астане за ${formatPrice(p.price)} | ${SITE.name}`;
  const description =
    p.meta_description ||
    truncate(
      `${p.name} по цене ${formatPrice(p.price)}${p.in_stock ? ", в наличии" : ""}. ${p.description ?? ""} Оптовые цены, доставка по Казахстану, гарантия.`,
      160,
    );
  return pageMetadata({ title, description, path: `/product/${p.slug}`, image: p.images[0]?.url });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  const crumbs = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/catalog" },
    ...(product.category ? [{ name: product.category.name, path: `/catalog/${product.category.slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <div className="container-x pb-16 pt-6 md:pb-24">
      <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(crumbs)]} />
      <nav aria-label="Хлебные крошки" className="mb-5 text-sm text-chrome">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.slice(0, -1).map((b, i) => (
            <li key={b.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              <Link href={b.path} className="hover:text-ink">{b.name}</Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery images={product.images} name={product.name} label={product.category?.name} />

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-wider text-chrome">
              {product.brand && (
                <Link href={`/brand/${product.brand.slug}`} className="text-cobalt hover:underline">{product.brand.name}</Link>
              )}
              {product.sku && <span>арт. {product.sku}</span>}
            </div>
            <h1 className="text-2xl font-semibold sm:text-[2.2rem]">{product.name}</h1>
          </div>

          <BuyBox
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              image: product.images[0]?.url ?? null,
              price: product.price,
              wholesalePrices: product.wholesale_prices,
            }}
            oldPrice={product.old_price}
            inStock={product.in_stock}
            productUrl={absoluteUrl(`/product/${product.slug}`)}
          />

          <ul className="grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["Гарантия", "Официальная, до 5 лет"],
              ["Доставка", "По Астане бесплатно от 50 000 ₸"],
              ["Самовывоз", "Через 2 часа, рынок «Шанхай»"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-grout bg-porcelain px-4 py-3">
                <p className="font-semibold">{t}</p>
                <p className="text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="space-y-10">
          {product.specs.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">Характеристики</h2>
              <dl className="divide-y divide-grout border-y border-grout">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 py-3">
                    <dt className="text-ink-soft">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {product.description && (
            <section>
              <h2 className="mb-4 text-2xl font-semibold">Описание</h2>
              <div className="prose-seo text-ink-soft">
                {product.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-[28px] bg-night p-6 text-white sm:p-8">
          <p className="eyebrow mb-2 !text-brass">Для объектов и тендеров</p>
          <h2 className="text-xl font-semibold sm:text-2xl">Нужна партия от 10 штук?</h2>
          <p className="mb-5 mt-2 text-white/70">
            Пришлите количество и адрес объекта — рассчитаем цену партии с доставкой и выставим счёт для ИП или ТОО.
          </p>
          <LeadForm
            dark
            source="product-wholesale"
            productId={product.id}
            withCompany
            withMessage
            messagePlaceholder={`Например: ${product.name} — 60 шт, доставка на объект`}
            submitLabel="Запросить цену партии"
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">Похожие товары</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => (
              <li key={p.id} className="flex"><ProductCard product={p} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
