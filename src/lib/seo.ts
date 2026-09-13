import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";
import { lowestPrice, sortedTiers } from "./pricing";
import type { ProductWithRelations } from "./types";

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noindex?: boolean;
}): Metadata {
  const images = image ? [{ url: image.startsWith("http") ? image : absoluteUrl(image) }] : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ru_KZ",
      siteName: SITE.name,
      title,
      description,
      url: path,
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": absoluteUrl("/#business"),
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    logo: absoluteUrl("/brand/sanlux-logo.png"),
    image: absoluteUrl("/photos/interior.jpg"),
    telephone: SITE.phones[0].tel,
    email: SITE.email,
    priceRange: "₸₸",
    currenciesAccepted: "KZT",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.street}, ${SITE.address.detail}`,
      addressLocality: SITE.address.city,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: SITE.hours.opens,
        closes: SITE.hours.closes,
      },
    ],
    areaServed: { "@type": "Country", name: "Казахстан" },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ru",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/catalog")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(p: ProductWithRelations) {
  const url = absoluteUrl(`/product/${p.slug}`);
  const availability = p.in_stock ? "https://schema.org/InStock" : "https://schema.org/PreOrder";
  const tiers = sortedTiers(p.wholesale_prices);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku ?? undefined,
    description: p.meta_description || p.description || `${p.name} — купить в Астане в магазине ${SITE.name}.`,
    image: p.images.map((img) => (img.url.startsWith("http") ? img.url : absoluteUrl(img.url))),
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    category: p.category?.name,
    additionalProperty: p.specs.map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value })),
    offers: tiers.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "KZT",
          lowPrice: lowestPrice(p.price, tiers),
          highPrice: p.price,
          offerCount: tiers.length + 1,
          availability,
          url,
          seller: { "@id": absoluteUrl("/#business") },
        }
      : {
          "@type": "Offer",
          priceCurrency: "KZT",
          price: p.price,
          availability,
          url,
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": absoluteUrl("/#business") },
        },
  };
}

export function itemListJsonLd(products: ProductWithRelations[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/product/${p.slug}`),
      name: p.name,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
