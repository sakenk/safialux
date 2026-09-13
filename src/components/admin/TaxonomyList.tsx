import Link from "next/link";
import SmartImage from "@/components/SmartImage";

export default function TaxonomyList({
  title,
  kind,
  addLabel,
  rows,
  publicPath,
}: {
  title: string;
  kind: "categories" | "brands";
  addLabel: string;
  publicPath: string;
  rows: { id: string; name: string; slug: string; image: string | null; count: number; sort_order: number; is_published: boolean }[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Link href={`/admin/${kind}/new`} className="btn btn-primary btn-sm">{addLabel}</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-grout bg-porcelain">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-grout text-xs uppercase tracking-wide text-chrome">
            <tr>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Адрес</th>
              <th className="px-4 py-3 text-right">Товаров</th>
              <th className="px-4 py-3 text-right">Порядок</th>
              <th className="px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grout-soft">
            {rows.map((r) => (
              <tr key={r.id} className={r.is_published ? "" : "bg-glaze/70 text-ink-soft"}>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/${kind}/${r.id}`} className="flex items-center gap-3 font-medium hover:text-cobalt">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-grout-soft bg-glaze">
                      {r.image && <SmartImage src={r.image} alt="" fill sizes="44px" className={kind === "brands" ? "object-contain p-1" : "object-cover"} />}
                    </span>
                    {r.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  <Link href={`${publicPath}${r.slug}`} target="_blank" className="text-chrome hover:text-cobalt">{publicPath}{r.slug}</Link>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">{r.count}</td>
                <td className="px-4 py-2.5 text-right font-mono">{r.sort_order}</td>
                <td className="px-4 py-2.5">{r.is_published ? "На сайте" : "Скрыт"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-ink-soft">Пока пусто — нажмите «{addLabel}».</p>}
      </div>
    </div>
  );
}
