import Link from "next/link";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import { LEAD_SOURCE, LEAD_STATUS, formatDate, formatKzPhone } from "@/components/admin/labels";
import { adminLeads, adminProducts } from "@/lib/admin-data";
import type { LeadStatus } from "@/lib/types";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminLeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status && sp.status in LEAD_STATUS ? sp.status : undefined;
  const [leads, products] = await Promise.all([adminLeads(status), adminProducts()]);
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Заявки</h1>
          <p className="text-sm text-chrome">Формы подбора, запросы КП и цены партии</p>
        </div>
        <nav className="flex gap-1 rounded-full bg-porcelain p-1 text-sm">
          {[["", "Все"], ...Object.entries(LEAD_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
            <Link
              key={k}
              href={k ? `/admin/leads?status=${k}` : "/admin/leads"}
              className={`rounded-full px-3 py-1.5 ${(status ?? "") === k ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-grout bg-porcelain p-10 text-center text-ink-soft">
          Заявок нет. Сюда попадают формы «Помощь с выбором», «Запросить КП» и «Цена партии» с сайта.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => {
            const product = lead.product_id ? productById.get(lead.product_id) : undefined;
            const wholesale = lead.source.includes("wholesale");
            const digits = lead.phone.replace(/\D/g, "");
            return (
              <li key={lead.id} className={`flex flex-col gap-3 rounded-2xl border bg-porcelain p-5 text-sm ${wholesale ? "border-brass/50" : "border-grout"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{lead.name}{lead.company_name ? ` · ${lead.company_name}` : ""}</p>
                    <a href={`tel:+${digits}`} className="font-mono text-cobalt hover:underline">{formatKzPhone(lead.phone)}</a>
                  </div>
                  <LeadStatusSelect id={lead.id} status={lead.status as LeadStatus} />
                </div>
                <p className="flex flex-wrap gap-2 text-xs text-chrome">
                  <span className={wholesale ? "font-semibold text-brass" : ""}>{LEAD_SOURCE[lead.source] ?? lead.source}</span>
                  <span>·</span>
                  <span>{formatDate(lead.created_at)}</span>
                </p>
                {product && (
                  <Link href={`/product/${product.slug}`} target="_blank" className="text-cobalt hover:underline">Товар: {product.name}</Link>
                )}
                {lead.message && <p className="whitespace-pre-line rounded-xl bg-glaze p-3 text-ink-soft">{lead.message}</p>}
                <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener" className="mt-auto text-[#178a48] hover:underline">Написать в WhatsApp</a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
