import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { formatPrice, sortedTiers } from "@/lib/pricing";
import type { ProductWithRelations } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";
import ProductPlaceholder from "./ProductPlaceholder";

const DIMENSION_LABELS = ["размер", "размеры", "габариты", "диаметр", "ширина", "длина"];

export function keyDimension(p: ProductWithRelations) {
  return p.specs.find((s) => DIMENSION_LABELS.includes(s.label.trim().toLowerCase()))?.value ?? null;
}

export default function ProductCard({ product, priority = false }: { product: ProductWithRelations; priority?: boolean }) {
  const image = product.images[0];
  const tiers = sortedTiers(product.wholesale_prices);
  const bestTier = tiers.at(-1);
  const discount =
    product.old_price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : 0;
  const dimension = keyDimension(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-grout bg-porcelain transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3.4] overflow-hidden bg-glaze">
        {image ? (
          <SmartImage
            src={image.url}
            alt={image.alt || product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductPlaceholder label={product.category?.name} />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {discount > 0 && <span className="rounded-full bg-danger px-2.5 py-1 font-mono text-xs text-white">−{discount}%</span>}
          {product.is_new && <span className="rounded-full bg-cobalt px-2.5 py-1 text-xs font-medium text-white">Новинка</span>}
          {product.is_featured && <span className="rounded-full bg-porcelain/95 px-2.5 py-1 text-xs font-medium text-ink">Хит</span>}
        </div>
        {!product.in_stock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-white">Под заказ</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        {dimension && <div className="dim" aria-label={`Размер: ${dimension}`}>{dimension}</div>}
        {product.brand && <p className="eyebrow !text-[11px]">{product.brand.name}</p>}
        <h3 className="font-sans text-[15px] font-medium leading-snug tracking-normal sm:text-base">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-lg font-medium tracking-tight sm:text-xl">{formatPrice(product.price)}</span>
            {discount > 0 && <s className="text-sm text-chrome">{formatPrice(product.old_price!)}</s>}
          </div>
          {bestTier && (
            <p className="mt-0.5 text-[13px] text-brass">
              от {bestTier.min_qty} шт — <b className="font-semibold">{formatPrice(bestTier.price)}</b>
            </p>
          )}
        </div>

        <div className="relative z-10 pt-2">
          <AddToCartButton
            compact
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              image: image?.url ?? null,
              price: product.price,
              wholesalePrices: product.wholesale_prices,
            }}
          />
        </div>
      </div>
    </article>
  );
}
