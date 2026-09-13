import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import { SITE } from "@/lib/site";
import { IconPhone, IconSearch } from "@/components/icons";
import CartButton from "./CartButton";
import NavLinks from "./NavLinks";

export default async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-grout bg-porcelain/90 backdrop-blur-md">
      <div className="hidden border-b border-grout-soft bg-glaze/60 md:block">
        <div className="container-x flex h-9 items-center justify-between text-[13px] text-ink-soft">
          <span>
            {SITE.address.city}, {SITE.address.street} · {SITE.hours.label}
          </span>
          <div className="flex items-center gap-5">
            <Link href="/optom" className="font-medium text-brass hover:text-ink">
              Оптовым клиентам и застройщикам
            </Link>
            <Link href="/dostavka-i-oplata" className="hover:text-ink">Доставка и оплата</Link>
            <Link href="/contacts" className="hover:text-ink">Контакты</Link>
          </div>
        </div>
      </div>

      <div className="container-x flex h-16 items-center gap-3 md:h-[72px] md:gap-6">
        <Link href="/" className="shrink-0" aria-label={`${SITE.name} — на главную`}>
          <Image src="/brand/sanlux-logo.png" alt={SITE.name} width={205} height={51} priority className="h-7 w-auto md:h-9" />
        </Link>

        <form action="/catalog" role="search" className="relative hidden flex-1 md:block">
          <label htmlFor="header-search" className="sr-only">Поиск по каталогу</label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Унитаз подвесной, ванна 170, артикул…"
            className="field !min-h-11 !rounded-full !pl-11"
          />
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chrome" />
        </form>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <a href={`tel:${SITE.phones[0].tel}`} className="hidden items-center gap-2 lg:flex">
            <span className="grid size-10 place-items-center rounded-full bg-cobalt-wash text-cobalt">
              <IconPhone width={18} height={18} />
            </span>
            <span className="leading-tight">
              <span className="block font-semibold">{SITE.phones[0].display}</span>
              <span className="block text-xs text-chrome">Звонок и WhatsApp</span>
            </span>
          </a>
          <a href={`tel:${SITE.phones[0].tel}`} className="grid size-11 place-items-center rounded-full border border-grout lg:hidden" aria-label="Позвонить">
            <IconPhone width={18} height={18} />
          </a>
          <CartButton />
        </div>
      </div>

      <nav aria-label="Разделы каталога" className="border-t border-grout-soft">
        <div className="container-x">
          <NavLinks categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
        </div>
      </nav>
    </header>
  );
}
