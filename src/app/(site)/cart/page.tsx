import Checkout from "@/components/cart/Checkout";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Корзина и оформление заказа | ${SITE.name}`,
  description: "Оформление заказа сантехники без регистрации.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return <Checkout />;
}
