import Image from "next/image";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { formatDate, formatKzPhone } from "@/components/admin/labels";
import { adminOrder } from "@/lib/admin-data";
import { formatPrice } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await adminOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-[13px] text-ink print:p-0">
      <div className="mb-4 flex justify-end print:hidden"><PrintButton /></div>
      <header className="flex items-start justify-between border-b-2 border-ink pb-4">
        <div>
          <Image src="/brand/SafiaLux.png" alt="SafiaLux" width={701} height={502} className="h-14 w-auto" />
          <p className="mt-1 text-ink-soft">{SITE.address.city}, {SITE.address.street} · {SITE.phones[0].display}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl">Заказ №{order.number}</p>
          <p className="text-ink-soft">{formatDate(order.created_at)}</p>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase text-chrome">Покупатель</p>
          {order.company_name && <p className="font-semibold">{order.company_name}{order.company_bin ? `, БИН ${order.company_bin}` : ""}</p>}
          <p>{order.customer_name}, {formatKzPhone(order.customer_phone)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-chrome">Получение</p>
          <p>{order.delivery_method === "delivery" ? `Доставка: ${[order.city, order.address].filter(Boolean).join(", ")}` : "Самовывоз"}</p>
          {order.comment && <p className="text-ink-soft">{order.comment}</p>}
        </div>
      </section>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ink text-xs uppercase text-ink-soft">
            <th className="py-2">№</th><th className="py-2">Товар</th><th className="py-2">Артикул</th>
            <th className="py-2 text-right">Кол-во</th><th className="py-2 text-right">Цена</th><th className="py-2 text-right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={i.product_id} className="border-b border-grout">
              <td className="py-2">{idx + 1}</td><td className="py-2">{i.name}</td><td className="py-2 font-mono text-xs">{i.sku ?? "—"}</td>
              <td className="py-2 text-right">{i.quantity}</td><td className="py-2 text-right">{formatPrice(i.unit_price)}</td>
              <td className="py-2 text-right font-semibold">{formatPrice(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={5} className="pt-3 text-right font-semibold">Итого ({order.items_count} шт)</td><td className="pt-3 text-right font-display text-lg">{formatPrice(Number(order.total))}</td></tr>
        </tfoot>
      </table>

      <div className="mt-12 grid grid-cols-2 gap-10 text-ink-soft">
        <p className="border-t border-ink pt-1">Отпустил</p>
        <p className="border-t border-ink pt-1">Получил</p>
      </div>
    </div>
  );
}
