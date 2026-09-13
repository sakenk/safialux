import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories, brands, products } = await getSitemapEntries();
  const latest = products.reduce((max, p) => (p.updated_at > max ? p.updated_at : max), "2026-01-01T00:00:00.000Z");

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/catalog"), lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/optom"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/brands"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/dostavka-i-oplata"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contacts"), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/catalog/${c.slug}`),
      lastModified: latest,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...brands.map((b) => ({
      url: absoluteUrl(`/brand/${b.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.slice(0, 3).map((img) => (img.url.startsWith("http") ? img.url : absoluteUrl(img.url))),
    })),
  ];
}
