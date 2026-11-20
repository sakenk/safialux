import { SITE, whatsappLink } from "@/lib/site";
import { IconPin, IconWhatsApp } from "@/components/icons";
import MapEmbed from "./MapEmbed";

export default function ContactsBlock({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const H = headingLevel;
  return (
    <div className="grid overflow-hidden rounded-[28px] border border-grout bg-porcelain lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-6 p-6 sm:p-9">
        <div>
          <p className="eyebrow mb-3">Магазин в Астане</p>
          <H className="text-2xl font-semibold sm:text-3xl">Приезжайте посмотреть сантехнику вживую</H>
        </div>
        <div className="flex gap-3">
          <IconPin className="mt-0.5 shrink-0 text-cobalt" />
          <div className="space-y-3">
            {[SITE.address, SITE.address2].map((a) => (
              <address key={a.street} className="not-italic">
                <span className="font-medium">{a.city}, {a.street}</span>
                <br />
                <span className="text-ink-soft">{a.detail}</span>
              </address>
            ))}
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="eyebrow mb-1">Телефоны</dt>
            {SITE.phones.map((p) => (
              <dd key={p.tel}><a href={`tel:${p.tel}`} className="text-lg font-semibold hover:text-cobalt">{p.display}</a></dd>
            ))}
          </div>
          <div>
            <dt className="eyebrow mb-1">Режим работы</dt>
            <dd>{SITE.hours.label}</dd>
            <dt className="eyebrow mb-1 mt-3">Почта</dt>
            <dd><a href={`mailto:${SITE.email}`} className="break-all hover:text-cobalt">{SITE.email}</a></dd>
          </div>
        </dl>
        <a href={whatsappLink(`Здравствуйте! Пишу с сайта ${SITE.name}.`)} target="_blank" rel="noopener" className="btn btn-whatsapp">
          <IconWhatsApp /> Написать в WhatsApp
        </a>
      </div>
      <MapEmbed />
    </div>
  );
}
