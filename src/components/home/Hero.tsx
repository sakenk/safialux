import Image from "next/image";
import Link from "next/link";
import { HERO, TRUST_POINTS } from "@/lib/content";
import { IconArrow } from "@/components/icons";

// Выноски на фото ведут в разделы каталога. Координаты — в процентах кадра 3:2 (photos/interior.jpg).
const CALLOUTS = [
  { href: "/catalog/vanny", label: "Ванны", kind: "dim", left: 1, top: 61, width: 33 },
  { href: "/catalog/rakoviny", label: "Раковины", kind: "dim", left: 42, top: 56, width: 32 },
  { href: "/catalog/smesiteli", label: "Смесители", kind: "pin", left: 69, top: 49 },
] as const;

export default function Hero() {
  return (
    <section className="tile-grid relative overflow-hidden border-b border-grout">
      <div className="container-x grid items-center gap-8 py-8 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div>
          <p className="eyebrow mb-4">{HERO.eyebrow}</p>
          <h1 className="text-[2rem] font-semibold sm:text-5xl xl:text-[3.6rem]">
            {HERO.title}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-ink-soft">{HERO.lead}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn btn-primary">
              Перейти в каталог <IconArrow width={18} height={18} />
            </Link>
            <Link href="/optom" className="btn btn-ghost">Запросить КП для объекта</Link>
          </div>
          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-grout pt-5">
            {TRUST_POINTS.map((p) => (
              <div key={p.label}>
                <dt className="sr-only">{p.label}</dt>
                <dd className="font-display text-lg font-medium sm:text-xl">{p.value}</dd>
                <dd className="text-[13px] leading-snug text-chrome">{p.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] shadow-float">
            <Image
              src="/photos/interior.jpg"
              alt="Ванная комната: отдельностоящая ванна, тумба с двумя раковинами и латунные смесители"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
            {CALLOUTS.map((c) =>
              c.kind === "dim" ? (
                <Link
                  key={c.href}
                  href={c.href}
                  className="dim group absolute hidden !text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.45)] sm:flex"
                  style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.width}%` }}
                >
                  <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] uppercase tracking-wider backdrop-blur group-hover:bg-cobalt">
                    {c.label}
                  </span>
                </Link>
              ) : (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group absolute hidden items-center gap-2 sm:flex"
                  style={{ left: `${c.left}%`, top: `${c.top}%` }}
                >
                  <span className="relative grid size-4 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />
                    <span className="size-2.5 rounded-full border-2 border-white bg-cobalt" />
                  </span>
                  <span className="h-px w-8 bg-white" />
                  <span className="rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur group-hover:bg-cobalt">
                    {c.label}
                  </span>
                </Link>
              ),
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            {CALLOUTS.map((c) => (
              <Link key={c.href} href={c.href} className="rounded-full border border-grout bg-porcelain px-3 py-1.5 font-mono text-xs uppercase tracking-wider">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
