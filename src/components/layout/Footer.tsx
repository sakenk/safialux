import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import { SITE, whatsappLink } from "@/lib/site";

export default async function Footer() {
  const categories = await getCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night pb-24 text-white/80 md:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="space-y-4">
          <Image src="/brand/SafiaLux.png" alt={SITE.name} width={701} height={502} className="h-14 w-auto" />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Продажа и доставка сантехники по Казахстану. Розница, опт, работа с ИП, ТОО и участниками тендеров.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4 !text-white/40">Каталог</p>
          <ul className="space-y-2 text-[15px]">
            {categories.map((c) => (
              <li key={c.id}><Link href={`/catalog/${c.slug}`} className="hover:text-white">{c.name}</Link></li>
            ))}
            <li><Link href="/brands" className="hover:text-white">Бренды</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 !text-white/40">Покупателям</p>
          <ul className="space-y-2 text-[15px]">
            <li><Link href="/optom" className="hover:text-white">Опт и застройщикам</Link></li>
            <li><Link href="/dostavka-i-oplata" className="hover:text-white">Доставка и оплата</Link></li>
            <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
            <li><Link href="/cart" className="hover:text-white">Корзина</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-[15px]">
          <p className="eyebrow mb-4 !text-white/40">Магазин</p>
          <address className="not-italic leading-relaxed">
            {SITE.address.city}, {SITE.address.street}
            <br />
            <span className="text-white/60">{SITE.address.detail}</span>
          </address>
          <p className="text-white/60">{SITE.hours.label}</p>
          <div className="space-y-1">
            {SITE.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="block font-semibold text-white hover:text-cobalt-wash">{p.display}</a>
            ))}
          </div>
          <a href={whatsappLink(`Здравствуйте! Пишу с сайта ${SITE.name}.`)} target="_blank" rel="noopener" className="inline-block text-[#4ade80] hover:underline">
            Написать в WhatsApp
          </a>
          <a href={`mailto:${SITE.email}`} className="block text-white/60 hover:text-white">{SITE.email}</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>© {year} {SITE.name}. Продажа сантехнического оборудования.</p>
          <p>Цены на сайте указаны в тенге и действительны при оформлении заказа.</p>
        </div>
      </div>
    </footer>
  );
}
