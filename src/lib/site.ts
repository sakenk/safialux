export const SITE = {
  name: "SanLux",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  city: "Астана",
  slogan: "Унитазы и сантехника для вашего дома",
  description:
    "Магазин сантехники в Астане: унитазы, ванны, раковины, смесители и инсталляции. Опт и розница, работаем с ИП, ТОО и тендерами. Доставка по Казахстану.",
  phones: [
    { display: "+7 (707) 444-72-71", tel: "+77074447271" },
    { display: "+7 (705) 631-09-30", tel: "+77056310930" },
  ],
  whatsapp: "77074447271",
  email: "smarttelefon4@gmail.com",
  address: {
    street: "ул. Алаш 34/6а",
    detail: "рынок «Шанхай», третий ряд, контейнер №119",
    city: "Астана",
    country: "KZ",
  },
  // Рынок «Шанхай», ул. Алаш 34/6а
  geo: { lat: 51.1872, lng: 71.3727 },
  hours: { label: "Ежедневно 9:00–18:00", opens: "09:00", closes: "18:00" },
  /** С какого объёма заказ считается оптовым (подсветка в админке). */
  wholesale: { qty: 10, total: 1_000_000 },
} as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
