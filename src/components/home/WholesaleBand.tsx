import Link from "next/link";
import { WHOLESALE_POINTS } from "@/lib/content";
import WholesaleCalculator, { type WholesaleSample } from "./WholesaleCalculator";

export default function WholesaleBand({ sample }: { sample: WholesaleSample | null }) {
  return (
    <section className="relative overflow-hidden bg-night text-white">
      <div className="container-x grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-3 !text-brass">Опт · застройщики · тендеры</p>
          <h2 className="text-3xl font-semibold sm:text-[2.6rem]">Партия от 10 до 1000 штук — по оптовой цене</h2>
          <p className="mt-4 max-w-xl text-[17px] text-white/70">
            Комплектуем санузлы жилых комплексов, гостиниц и офисов. Цена за штуку снижается автоматически, как только
            количество в корзине доходит до оптовой ступени.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {WHOLESALE_POINTS.map((p) => (
              <li key={p.title} className="border-t border-white/15 pt-4">
                <p className="font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-sm text-white/60">{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/optom" className="btn btn-primary">Запросить коммерческое предложение</Link>
            <Link href="/catalog" className="btn border border-white/25 text-white hover:border-white">Собрать заказ в каталоге</Link>
          </div>
        </div>

        {sample && <WholesaleCalculator sample={sample} />}
      </div>
    </section>
  );
}
