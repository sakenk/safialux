import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import ProductPlaceholder from "@/components/catalog/ProductPlaceholder";
import { formatPrice } from "@/lib/pricing";
import { pluralRu } from "@/lib/text";
import type { Category } from "@/lib/types";

export default function CategoryTiles({
  categories,
  stats,
}: {
  categories: Category[];
  stats: Map<string, { count: number; minPrice: number }>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
      {categories.map((c, i) => {
        const s = stats.get(c.id);
        // Первые две плитки крупнее — ванны и раковины с лучшими фото
        const wide = i < 2 ? "lg:col-span-3" : "lg:col-span-2";
        return (
          <li key={c.id} className={`${wide} ${i === 0 ? "col-span-2" : ""}`}>
            <Link
              href={`/catalog/${c.slug}`}
              className="group relative flex h-full min-h-44 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-grout bg-porcelain sm:min-h-56 lg:min-h-64"
            >
              {c.image_url ? (
                <SmartImage
                  src={c.image_url}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <ProductPlaceholder label={c.name} />
              )}
              <div className={`absolute inset-0 ${c.image_url ? "bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" : ""}`} />
              <div className={`relative p-4 sm:p-5 ${c.image_url ? "text-white" : ""}`}>
                <h3 className="text-lg font-semibold sm:text-2xl">{c.name}</h3>
                {s && (
                  <p className={`mt-1 font-mono text-xs ${c.image_url ? "text-white/75" : "text-chrome"}`}>
                    {s.count} {pluralRu(s.count, ["товар", "товара", "товаров"])} · от {formatPrice(s.minPrice)}
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
