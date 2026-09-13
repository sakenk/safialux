import OrderSuccess from "@/components/cart/OrderSuccess";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Заказ оформлен | ${SITE.name}`,
  description: "Спасибо за заказ в SanLux.",
  path: "/order/success",
  noindex: true,
});

export default function OrderSuccessPage() {
  return <OrderSuccess />;
}
