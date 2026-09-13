import Image from "next/image";
import Link from "next/link";
import { FAQ, REASONS, STEPS } from "@/lib/content";
import type { Brand } from "@/lib/types";
import SectionHeader from "@/components/SectionHeader";

export function Reasons() {
  return (
    <section className="container-x py-14 md:py-20">
      <SectionHeader eyebrow="Почему SanLux" title="Почему покупатели выбирают наш магазин" />
      <ul className="grid overflow-hidden rounded-[var(--radius-card)] border border-grout bg-grout sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 1 }}>
        {REASONS.map((r) => (
          <li key={r.title} className="bg-porcelain p-6 sm:p-7">
            <h3 className="font-sans text-lg font-semibold tracking-normal">{r.title}</h3>
            <p className="mt-2 text-ink-soft">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Steps() {
  return (
    <section className="border-y border-grout bg-porcelain">
      <div className="container-x py-14 md:py-20">
        <SectionHeader eyebrow="Как купить" title="От выбора до установки — четыре шага" />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="dim mb-4 !justify-start">
                <span>шаг {i + 1} из {STEPS.length}</span>
              </div>
              <h3 className="font-sans text-lg font-semibold tracking-normal">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BrandsMarquee({ brands }: { brands: Brand[] }) {
  const withLogos = brands.filter((b) => b.logo_url);
  if (!withLogos.length) return null;
  const loop = [...withLogos, ...withLogos];

  return (
    <section className="py-14 md:py-20">
      <div className="container-x">
        <SectionHeader
          eyebrow="Производители"
          title="Бренды, с которыми мы работаем"
          link={{ href: "/brands", label: "Все бренды" }}
        />
      </div>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {loop.map((b, i) => (
            <li key={`${b.id}-${i}`} aria-hidden={i >= withLogos.length}>
              <Link
                href={`/brand/${b.slug}`}
                tabIndex={i >= withLogos.length ? -1 : undefined}
                className="grid h-24 w-44 place-items-center rounded-2xl border border-grout bg-porcelain px-6 grayscale transition hover:grayscale-0"
              >
                <Image src={b.logo_url!} alt={b.name} width={140} height={64} className="max-h-14 w-auto object-contain mix-blend-multiply" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq({ items = FAQ }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-grout border-y border-grout">
      {items.map((item) => (
        <details key={item.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-grout text-cobalt transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="pb-5 pr-10 text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
