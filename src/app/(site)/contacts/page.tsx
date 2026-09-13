import JsonLd from "@/components/JsonLd";
import ContactsBlock from "@/components/home/ContactsBlock";
import LeadForm from "@/components/forms/LeadForm";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Контакты магазина сантехники в Астане — ${SITE.address.street} | ${SITE.name}`,
  description: `Магазин SanLux: ${SITE.address.city}, ${SITE.address.street}, ${SITE.address.detail}. Телефон ${SITE.phones[0].display}, ${SITE.hours.label.toLowerCase()}.`,
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <div className="container-x space-y-10 pb-20 pt-10">
      <JsonLd data={breadcrumbJsonLd([{ name: "Главная", path: "/" }, { name: "Контакты", path: "/contacts" }])} />
      <ContactsBlock headingLevel="h1" />
      <section className="grid gap-6 rounded-[28px] border border-grout bg-porcelain p-6 sm:p-9 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-2xl font-semibold">Перезвоним сами</h2>
          <p className="mt-2 text-ink-soft">Оставьте номер — ответим на вопросы о наличии, доставке и оптовых ценах.</p>
        </div>
        <LeadForm source="contacts" withMessage messagePlaceholder="Ваш вопрос" submitLabel="Жду звонка" />
      </section>
    </div>
  );
}
