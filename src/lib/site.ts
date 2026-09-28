export const SITE = {
  name: "SafiaLux",
  alternateName: ["Сафиа Люкс", "SafiaLux.kz"],
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://safialux.kz").replace(/\/$/, ""),
  city: "Астана",
  slogan: "Унитазы и сантехника для вашего дома",
  description:
    "Сантехника в Астане: унитазы, ванны, раковины, смесители, инсталляции. Опт от 10 шт., счёт для ТОО и ИП, доставка по Казахстану. ☎ +7 707 444-72-71",
  ogImage: "/photos/interior.jpg",
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
