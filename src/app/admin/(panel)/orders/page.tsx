import Link from "next/link";
import { ORDER_STATUS, formatDate, formatKzPhone, isBigOrder } from "@/components/admin/labels";
import { adminOrders } from "@/lib/admin-data";
import { formatPrice } from "@/lib/pricing";
import type { OrderStatus } from "@/lib/types";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filter = {
    status: sp.status && sp.status in ORDER_STATUS ? sp.status : undefined,
    type: sp.type === "company" ? "company" : undefined,
    from: /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from : undefined,
    to: /^\d{4}-\d{2}-\d{2}$/.test(sp.to ?? "") ? sp.to : undefined,
  };
  const orders = await adminOrders(filter);
  const total = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Заказы</h1>
          <p className="text-sm text-chrome">{orders.length} шт · на сумму {formatPrice(total)} без отменённых</p>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-grout bg-porcelain p-4">
        <label>
          <span className="label">Статус</span>
          <select name="status" defaultValue={filter.status ?? ""} className="field !min-h-10 !py-2">
            <option value="">Все</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Покупатель</span>
          <select name="type" defaultValue={filter.type ?? ""} className="field !min-h-10 !py-2">
            <option value="">Все</option>
            <option value="company">Только компании</option>
          </select>
        </label>
        <label>
          <span className="label">С даты</span>
          <input type="date" name="from" defaultValue={filter.from} className="field !min-h-10 !py-2" />
        </label>
        <label>
          <span className="label">По дату</span>
          <input type="date" name="to" defaultValue={filter.to} className="field !min-h-10 !py-2" />
        </label>
        <button className="btn btn-dark btn-sm">Показать</button>
        <Link href="/admin/orders" className="btn btn-ghost btn-sm">Сбросить</Link>
      </form>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-grout bg-porcelain p-10 text-center text-ink-soft">
          Заказов пока нет. Они появятся здесь, как только покупатель оформит корзину на сайте.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-grout bg-porcelain">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-grout text-xs uppercase tracking-wide text-chrome">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Покупатель</th>
                <th className="px-4 py-3">Состав</th>
                <th className="px-4 py-3">Получение</th>
                <th className="px-4 py-3 text-right">Сумма</th>
                <th className="px-4 py-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grout-soft">
              {orders.map((o) => {
                const big = isBigOrder(o);
                return (
                  <tr key={o.id} className={`hover:bg-glaze/60 ${big ? "bg-brass-wash/40" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-cobalt hover:underline">#{o.number}</Link>
                      {big && <span className="ml-2 rounded bg-brass px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">опт</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.company_name || o.customer_name}</p>
                      <p className="text-xs text-chrome">{o.company_name ? `${o.customer_name} · ` : ""}{formatKzPhone(o.customer_phone)}</p>
                    </td>
                    <td className="max-w-64 px-4 py-3">
                      <p className="truncate">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}</p>
                      <p className="text-xs text-chrome">{o.items_count} шт</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{o.delivery_method === "delivery" ? `Доставка${o.city ? `, ${o.city}` : ""}` : "Самовывоз"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS[o.status as OrderStatus].className}`}>
                        {ORDER_STATUS[o.status as OrderStatus].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
