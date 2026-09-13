import type { Brand, Category, Product } from "./types";

// Демо-каталог для запуска без Supabase: показывает дизайн и сценарий заказа.
// Как только заданы ключи Supabase, эти данные не используются.

const T = "2026-09-01T00:00:00.000Z";

const seo = { h1: null, seo_title: null, seo_description: null, seo_text: null };

export const DEMO_CATEGORIES: Category[] = [
  {
    id: "c-vanny", slug: "vanny", name: "Ванны", sort_order: 10, is_published: true, created_at: T,
    description: "Акриловые и стальные ванны Grohe, AM.PM, Cersanit. Подбор, доставка и установка.",
    image_url: "/photos/showroom-3.jpg",
    h1: "Ванны в Астане",
    seo_title: "Ванны в Астане — купить акриловую ванну от 35 000 ₸ | SanLux",
    seo_description: "Акриловые ванны в Астане по цене от 35 000 ₸. Оптом и в розницу, доставка по Казахстану, гарантия до 5 лет.",
    seo_text: "Мы выполняем полный перечень работ по выбору, доставке и установке акриловых ванн различных производителей: Grohe, AM.PM, Cersanit и других. Для застройщиков и участников тендеров действуют оптовые цены — от 10 штук одной модели.",
  },
  {
    id: "c-rakoviny", slug: "rakoviny", name: "Раковины", sort_order: 20, is_published: true, created_at: T,
    description: "Раковины на пьедестале, накладные и тумбы с раковиной.",
    image_url: "/photos/rakoviny.jpeg",
    h1: "Раковины для ванной в Астане",
    seo_title: "Раковины в Астане — купить от 25 000 ₸ | SanLux",
    seo_description: "Раковины, тумбы с раковиной и раковины на пьедестале в Астане от 25 000 ₸. Опт и розница, доставка по РК.",
    seo_text: "В стоимость входит бесплатный дизайн-проект. Расчёт всех работ производим в день замеров.",
  },
  {
    id: "c-unitazy", slug: "unitazy", name: "Унитазы", sort_order: 30, is_published: true, created_at: T,
    description: "Напольные и подвесные унитазы, компакты и безободковые модели.",
    image_url: "/photos/unitazy.jpg",
    h1: "Унитазы в Астане",
    seo_title: "Унитазы в Астане — купить от 25 000 ₸, опт и розница | SanLux",
    seo_description: "Унитазы в Астане от 25 000 ₸: подвесные, напольные, безободковые. Оптом для застройщиков, доставка по Казахстану.",
    seo_text: "Подберём унитаз из широкого ассортимента под ваши задачи и бюджет. Продаём оптом и в розницу, обслуживаем частных клиентов и строительные компании.",
  },
  {
    id: "c-smesiteli", slug: "smesiteli", name: "Смесители", sort_order: 40, is_published: true, created_at: T,
    description: "Смесители для ванны, раковины и кухни, душевые системы.",
    image_url: null, ...seo,
  },
  {
    id: "c-installyacii", slug: "installyacii", name: "Инсталляции", sort_order: 50, is_published: true, created_at: T,
    description: "Инсталляции для подвесных унитазов и кнопки смыва.",
    image_url: null, ...seo,
  },
];

const brand = (slug: string, name: string, logo: string, sort: number): Brand => ({
  id: `b-${slug}`, slug, name, logo_url: logo, sort_order: sort, is_published: true, created_at: T,
  description: null, country: null, ...seo,
});

export const DEMO_BRANDS: Brand[] = [
  brand("grohe", "Grohe", "/brands/grohe.png", 10),
  brand("gappo", "Gappo", "/brands/gappo.jpeg", 20),
  brand("saniteco", "Saniteco", "/brands/saniteco.png", 30),
  brand("triton", "Triton", "/brands/triton.png", 40),
  brand("cersanit", "Cersanit", "/brands/cersanit.png", 50),
  brand("am-pm", "AM.PM", "/brands/ampm.png", 60),
  brand("lusso", "Lusso", "/brands/lusso.png", 70),
  brand("santek", "Santek", "/brands/santek.png", 80),
  brand("1marka", "1Marka", "/brands/1marka.png", 90),
  brand("santehprom", "Сантехпром", "/brands/santehprom.png", 100),
  brand("frap", "Frap", "/brands/frap.jpeg", 110),
  brand("sanita-luxe", "Sanita Luxe", "/brands/sanita-luxe.jpg", 120),
];

type DemoInput = Pick<Product, "slug" | "name" | "price" | "category_id"> & Partial<Product>;

const product = (i: number, p: DemoInput): Product => ({
  id: `p-${p.slug}`,
  brand_id: null,
  sku: null,
  description: null,
  old_price: null,
  wholesale_prices: [],
  images: [],
  specs: [],
  in_stock: true,
  is_featured: false,
  is_new: false,
  is_sale: false,
  is_published: true,
  sort_order: 100 - i,
  meta_title: null,
  meta_description: null,
  created_at: T,
  updated_at: T,
  ...p,
});

export const DEMO_PRODUCTS: Product[] = [
  product(1, {
    slug: "akrilovaya-vanna-170x70", name: "Акриловая ванна 170×70", category_id: "c-vanny", brand_id: "b-am-pm",
    sku: "AMP-170-70", price: 89000, old_price: 99000, is_featured: true, is_sale: true,
    wholesale_prices: [{ min_qty: 10, price: 82000 }, { min_qty: 50, price: 76000 }],
    images: [{ url: "/photos/showroom-3.jpg" }],
    specs: [
      { label: "Размер", value: "1700 × 700 мм" }, { label: "Материал", value: "Санитарный акрил" },
      { label: "Глубина", value: "420 мм" }, { label: "Гарантия", value: "5 лет" },
    ],
    description: "Прямоугольная акриловая ванна для стандартных санузлов. Толщина акрила 5 мм, усиленное дно, в комплекте каркас и ножки.",
  }),
  product(2, {
    slug: "podvesnoy-unitaz-bezobodkovyy", name: "Подвесной унитаз безободковый", category_id: "c-unitazy", brand_id: "b-cersanit",
    sku: "CER-WH-520", price: 64000, is_featured: true, is_new: true,
    wholesale_prices: [{ min_qty: 10, price: 59000 }, { min_qty: 50, price: 54000 }],
    images: [{ url: "/photos/unitazy.jpg" }, { url: "/photos/showroom-1.jpg" }],
    specs: [
      { label: "Размер", value: "520 × 360 мм" }, { label: "Монтаж", value: "Подвесной" },
      { label: "Сиденье", value: "Микролифт, дюропласт" }, { label: "Гарантия", value: "5 лет" },
    ],
    description: "Безободковая чаша легко моется, сиденье с плавным опусканием. Устанавливается на инсталляцию.",
  }),
  product(3, {
    slug: "napolnyy-unitaz-kompakt", name: "Напольный унитаз-компакт", category_id: "c-unitazy", brand_id: "b-santek",
    sku: "STK-KMP-01", price: 25000, is_featured: true,
    wholesale_prices: [{ min_qty: 10, price: 23000 }, { min_qty: 50, price: 21000 }],
    images: [{ url: "/photos/showroom-1.jpg" }],
    specs: [{ label: "Выпуск", value: "Косой" }, { label: "Бачок", value: "Двойной смыв 3/6 л" }],
  }),
  product(4, {
    slug: "rakovina-nakladnaya-kruglaya", name: "Раковина накладная круглая", category_id: "c-rakoviny", brand_id: "b-lusso",
    sku: "LS-R-420", price: 25000, is_new: true,
    wholesale_prices: [{ min_qty: 20, price: 22000 }],
    images: [{ url: "/photos/rakoviny.jpeg" }],
    specs: [{ label: "Диаметр", value: "420 мм" }, { label: "Материал", value: "Санфаянс" }],
  }),
  product(5, {
    slug: "tumba-s-rakovinoy-80", name: "Тумба с раковиной 80 см", category_id: "c-rakoviny", brand_id: "b-sanita-luxe",
    sku: "SL-T80", price: 118000, is_featured: true,
    wholesale_prices: [{ min_qty: 10, price: 109000 }],
    images: [{ url: "/photos/showroom-3.jpg" }],
    specs: [{ label: "Ширина", value: "800 мм" }, { label: "Монтаж", value: "Подвесной" }],
  }),
  product(6, {
    slug: "smesitel-dlya-vanny-s-dushem", name: "Смеситель для ванны с душем", category_id: "c-smesiteli", brand_id: "b-grohe",
    sku: "GR-BATH-33", price: 42000, in_stock: false,
    wholesale_prices: [{ min_qty: 10, price: 38500 }],
    specs: [{ label: "Покрытие", value: "Хром" }, { label: "Картридж", value: "Керамический, 46 мм" }],
  }),
  product(7, {
    slug: "installyaciya-dlya-unitaza-s-knopkoy", name: "Инсталляция для унитаза с кнопкой", category_id: "c-installyacii", brand_id: "b-am-pm",
    sku: "AMP-INST-5", price: 56000,
    wholesale_prices: [{ min_qty: 10, price: 51000 }, { min_qty: 50, price: 47000 }],
    specs: [{ label: "Высота", value: "1120 мм" }, { label: "Нагрузка", value: "до 400 кг" }],
  }),
  product(8, {
    slug: "akrilovaya-vanna-150x70", name: "Акриловая ванна 150×70", category_id: "c-vanny", brand_id: "b-triton",
    sku: "TR-150-70", price: 35000,
    wholesale_prices: [{ min_qty: 10, price: 32000 }, { min_qty: 50, price: 29500 }],
    images: [{ url: "/photos/interior.jpg" }],
    specs: [{ label: "Размер", value: "1500 × 700 мм" }, { label: "Материал", value: "Акрил" }],
  }),
];
