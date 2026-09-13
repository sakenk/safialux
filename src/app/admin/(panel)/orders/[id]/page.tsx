import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import { ORDER_STATUS, formatDate, formatKzPhone, isBigOrder } from "@/components/admin/labels";
import { adminOrder } from "@/lib/admin-data";
import { formatPrice } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";
import type { OrderStatus } from "@/lib/types";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await adminOrder(id);
  if (!order) notFound();
  const status = ORDER_STATUS[order.status as OrderStatus];
  const phoneDigits = order.customer_phone.replace(/\D/g, "");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-cobalt hover:underline">← Все заказы</Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 text-2xl font-semibold">
            Заказ #{order.number}
            <span className={`rounded-full px-2.5 py-1 font-sans text-xs font-medium tracking-normal ${status.className}`}>{status.label}</span>
            {isBigOrder(order) && <span className="rounded-full bg-brass px-2.5 py-1 font-sans text-xs font-medium tracking-normal text-white">Крупный заказ</span>}
          </h1>
          <p className="text-sm text-chrome">{formatDate(order.created_at)}</p>
        </div>
        <Link href={`/admin/orders/${order.id}/print`} target="_blank" className="btn btn-ghost btn-sm">Печать / PDF</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-x-auto rounded-2xl border border-grout bg-porcelain">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-grout text-xs uppercase tracking-wide text-chrome">
              <tr>
                <th className="px-4 py-3">Товар</th>
                <th className="px-4 py-3 text-right">Кол-во</th>
                <th className="px-4 py-3 text-right">Цена</th>
                <th className="px-4 py-3 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grout-soft">
              {order.items.map((i) => (
                <tr key={i.product_id}>
                  <td className="px-4 py-3">
                    <Link href={`/product/${i.slug}`} target="_blank" className="font-medium hover:text-cobalt">{i.name}</Link>
                    {i.sku && <p className="font-mono text-xs text-chrome">арт. {i.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{i.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{formatPrice(i.unit_price)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPrice(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-grout">
                <td className="px-4 py-3 font-semibold" colSpan={3}>Итого, {order.items_count} шт</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-display text-lg">{formatPrice(Number(order.total))}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <aside className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-grout bg-porcelain p-5 text-sm">
            <h2 className="font-sans text-base font-semibold tracking-normal">Покупатель</h2>
            {order.customer_type === "company" && (
              <div>
                <p className="font-medium">{order.company_name}</p>
                {order.company_bin && <p className="font-mono text-xs text-chrome">БИН {order.company_bin}</p>}
                {order.needs_invoice && <p className="text-brass">Нужен счёт с НДС</p>}
              </div>
            )}
            <p>{order.customer_name}</p>
            <p className="font-mono">{formatKzPhone(order.customer_phone)}</p>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:+${phoneDigits}`} className="btn btn-dark btn-sm">Позвонить</a>
              <a href={whatsappLink(`Здравствуйте, ${order.customer_name}! Это SanLux, по вашему заказу №${order.number}.`).replace(/wa\.me\/\d+/, `wa.me/${phoneDigits}`)} target="_blank" rel="noopener" className="btn btn-whatsapp btn-sm">WhatsApp</a>
            </div>
            <div className="border-t border-grout-soft pt-3">
              <p className="text-chrome">Получение</p>
              <p>{order.delivery_method === "delivery" ? `Доставка: ${[order.city, order.address].filter(Boolean).join(", ")}` : "Самовывоз"}</p>
            </div>
            {order.comment && (
              <div className="border-t border-grout-soft pt-3">
                <p className="text-chrome">Комментарий покупателя</p>
                <p className="whitespace-pre-line">{order.comment}</p>
              </div>
            )}
          </section>
          <OrderActions id={order.id} status={order.status as OrderStatus} note={order.admin_note ?? ""} />
        </aside>
      </div>
    </div>
  );
}
