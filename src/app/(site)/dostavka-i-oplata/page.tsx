import JsonLd from "@/components/JsonLd";
import SectionHeader from "@/components/SectionHeader";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Доставка и оплата сантехники по Астане и Казахстану | ${SITE.name}`,
  description:
    "Доставка сантехники по Астане бесплатно от 50 000 ₸, в регионы Казахстана — от 5 000 ₸. Самовывоз через 2 часа. Оплата наличными, картой, по счёту, рассрочка 0%.",
  path: "/dostavka-i-oplata",
});

const BLOCKS = [
  {
    title: "Самовывоз",
    rows: [
      ["Где", `${SITE.address.city}, ${SITE.address.street}, ${SITE.address.detail}`],
      ["Когда", SITE.hours.label],
      ["Срок", "Заказ в наличии соберём за 2 часа"],
      ["Стоимость", "Бесплатно"],
    ],
  },
  {
    title: "Доставка по Астане",
    rows: [
      ["Срок", "1–2 дня"],
      ["Стоимость", "Бесплатно при заказе от 50 000 ₸"],
      ["На объект", "Привезём партию на стройку, разгрузка по договорённости"],
    ],
  },
  {
    title: "Доставка по Казахстану",
    rows: [
      ["Срок", "От 1 дня, зависит от города"],
      ["Стоимость", "От 5 000 ₸, точная сумма — после расчёта"],
      ["Как", "Транспортными компаниями до терминала или адреса"],
    ],
  },
  {
    title: "Оплата",
    rows: [
      ["Частным покупателям", "Наличными или картой при получении, переводом"],
      ["Компаниям", "По счёту для ИП и ТОО, закрывающие документы"],
      ["Рассрочка", "0% до 12 месяцев, первый платёж — после доставки"],
    ],
  },
];

export default function DeliveryPage() {
  return (
    <div className="container-x pb-20 pt-10">
      <JsonLd data={breadcrumbJsonLd([{ name: "Главная", path: "/" }, { name: "Доставка и оплата", path: "/dostavka-i-oplata" }])} />
      <SectionHeader as="h1" eyebrow="Покупателям" title="Доставка и оплата" lead="Заказ подтверждаем по телефону — менеджер назовёт точные сроки и стоимость доставки до оплаты." />
      <div className="grid gap-4 md:grid-cols-2">
        {BLOCKS.map((b) => (
          <section key={b.title} className="rounded-[var(--radius-card)] border border-grout bg-porcelain p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold">{b.title}</h2>
            <dl className="divide-y divide-grout-soft">
              {b.rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <section className="mt-4 rounded-[var(--radius-card)] border border-grout bg-porcelain p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold">Гарантия и возврат</h2>
        <p className="text-ink-soft">
          Все товары имеют официальную гарантию производителя от 1 до 5 лет. Возврат возможен в течение 14 дней при сохранении
          товарного вида; смесители и душевые системы — в оригинальной упаковке. Санфаянс возврату не подлежит из соображений гигиены.
        </p>
      </section>
    </div>
  );
}
