import CommercialOffer from "@/components/cart/CommercialOffer";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Коммерческое предложение | ${SITE.name}`,
  description: "Коммерческое предложение по составу корзины.",
  path: "/cart/kp",
  noindex: true,
});

export default function CommercialOfferPage() {
  return <CommercialOffer />;
}
