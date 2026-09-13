import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/forms/LeadForm";
import { Faq } from "@/components/home/InfoSections";
import { WHOLESALE_POINTS } from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { SITE, whatsappLink } from "@/lib/site";
import { IconWhatsApp } from "@/components/icons";

export const metadata = pageMetadata({
  title: `Сантехника оптом в Астане — для застройщиков, ИП, ТОО и тендеров | ${SITE.name}`,
  description:
    "Оптовые поставки сантехники в Астане и по Казахстану: унитазы, ванны, раковины, смесители, инсталляции партиями от 10 штук. Счёт с НДС, доставка на объект, КП за 24 часа.",
  path: "/optom",
  image: "/photos/showroom-3.jpg",
});

const WHOLESALE_FAQ = [
  {
    q: "С какого количества действует оптовая цена?",
    a: "Для большинства товаров — от 10 штук одной позиции, дополнительная скидка — от 50 штук. Ступени цен указаны в карточке каждого товара, в корзине цена пересчитывается автоматически.",
  },
  {
    q: "Работаете ли вы по безналичному расчёту?",
    a: "Да. Выставляем счёт на оплату для ИП и ТОО, предоставляем закрывающие документы. БИН укажите при оформлении заказа.",
  },
  {
    q: "Можно ли отправить спецификацию из проекта?",
    a: "Да. Пришлите список позиций в форме ниже или в WhatsApp — подберём аналоги, если какой-то модели нет, и вернёмся с ценами и сроками в течение 24 часов.",
  },
  {
    q: "Доставляете ли на объект в регионы?",
    a: "Доставляем по Астане на объект, в регионы Казахстана отправляем транспортными компаниями. Стоимость рассчитываем под объём партии.",
  },
];

const AUDIENCE = [
  { title: "Застройщики", text: "Комплектация санузлов жилых комплексов по графику поставок." },
  { title: "Подрядчики и бригады", text: "Регулярные закупки под ремонт квартир и коммерческих помещений." },
  { title: "Участники тендеров", text: "Коммерческие предложения, счета и документы для госзакупок." },
  { title: "Гостиницы и офисы", text: "Однотипная сантехника на десятки номеров и санузлов." },
];

export default function WholesalePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Опт", path: "/optom" },
          ]),
          faqJsonLd(WHOLESALE_FAQ),
        ]}
      />

      <section className="bg-night text-white">
        <div className="container-x grid items-center gap-10 py-12 md:py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-brass">Опт · ИП · ТОО · тендеры</p>
            <h1 className="text-[2rem] font-semibold sm:text-5xl">Сантехника оптом для объектов в Астане и по Казахстану</h1>
            <p className="mt-5 max-w-xl text-[17px] text-white/70">
              Поставляем унитазы, ванны, раковины, смесители и инсталляции партиями — от 10 до нескольких сотен штук одной модели.
              Счёт с НДС, доставка на объект, коммерческое предложение за 24 часа.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#kp" className="btn btn-primary">Запросить КП</a>
              <a
                href={whatsappLink("Здравствуйте! Нужна сантехника оптом для объекта.")}
                target="_blank"
                rel="noopener"
                className="btn btn-whatsapp"
              >
                <IconWhatsApp /> Отправить спецификацию
              </a>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
            <Image src="/photos/showroom-3.jpg" alt="Санузел с ванной, раковиной на столешнице и полотенцесушителем" fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <h2 className="mb-8 text-2xl font-semibold sm:text-[2.1rem]">Условия для оптовых клиентов</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHOLESALE_POINTS.map((p) => (
            <li key={p.title} className="rounded-[var(--radius-card)] border border-grout bg-porcelain p-6">
              <h3 className="font-sans text-lg font-semibold tracking-normal">{p.title}</h3>
              <p className="mt-2 text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-grout bg-porcelain">
        <div className="container-x py-14 md:py-20">
          <h2 className="mb-8 text-2xl font-semibold sm:text-[2.1rem]">С кем работаем</h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a) => (
              <li key={a.title}>
                <div className="dim mb-4 !justify-start"><span>{a.title}</span></div>
                <p className="text-ink-soft">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
        <div id="kp" className="scroll-mt-40 rounded-[28px] border border-grout bg-porcelain p-6 sm:p-9">
          <p className="eyebrow mb-3">Ответ за 24 часа</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Запросить коммерческое предложение</h2>
          <p className="mb-6 mt-3 text-ink-soft">
            Перечислите позиции и количество или вставьте спецификацию из проекта. Можно собрать заказ в{" "}
            <Link href="/catalog" className="text-cobalt hover:underline">каталоге</Link> и скачать КП прямо из корзины.
          </p>
          <LeadForm
            source="wholesale"
            withCompany
            withMessage
            messagePlaceholder={"Например:\nУнитаз подвесной — 120 шт\nИнсталляция — 120 шт\nВанна 170×70 — 80 шт\nАдрес объекта, сроки"}
            submitLabel="Получить КП"
          />
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">Вопросы об оптовых поставках</h2>
          <Faq items={WHOLESALE_FAQ} />
        </div>
      </section>
    </>
  );
}
