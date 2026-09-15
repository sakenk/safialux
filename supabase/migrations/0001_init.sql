-- SanLux: каталог, заказы и заявки.
-- Применить: Supabase Dashboard → SQL Editor → вставить файл целиком → Run.

create extension if not exists pgcrypto;

-- ─── Категории ───────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  image_url text,
  h1 text,
  seo_title text,
  seo_description text,
  seo_text text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Бренды ──────────────────────────────────────────────────
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  logo_url text,
  country text,
  h1 text,
  seo_title text,
  seo_description text,
  seo_text text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Товары ──────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  sku text,
  description text,
  price numeric(12, 0) not null check (price >= 0),
  old_price numeric(12, 0) check (old_price is null or old_price >= 0),
  wholesale_prices jsonb not null default '[]'::jsonb,  -- [{min_qty, price}]
  images jsonb not null default '[]'::jsonb,            -- [{url, alt}], первое — главное
  specs jsonb not null default '[]'::jsonb,             -- [{label, value}]
  in_stock boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_sale boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id) where is_published;
create index if not exists products_brand_idx on public.products (brand_id) where is_published;
create index if not exists products_featured_idx on public.products (is_featured) where is_published;
create index if not exists products_name_search_idx on public.products using gin (to_tsvector('russian', name || ' ' || coalesce(sku, '')));

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ─── Заказы ──────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  customer_type text not null default 'person' check (customer_type in ('person', 'company')),
  customer_name text not null,
  customer_phone text not null,
  company_name text,
  company_bin text,
  needs_invoice boolean not null default false,
  city text,
  delivery_method text not null default 'pickup' check (delivery_method in ('pickup', 'delivery')),
  address text,
  comment text,
  items jsonb not null,
  items_count int not null default 0,
  total numeric(14, 0) not null default 0,
  status text not null default 'new' check (status in ('new', 'processing', 'done', 'cancelled')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ─── Заявки (подбор, КП для опта, «рассчитать стоимость») ────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  company_name text,
  message text,
  source text not null default 'site',
  product_id uuid references public.products(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'in_work', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists leads_created_idx on public.leads (created_at desc);

-- ─── RLS: анонимы только читают опубликованный каталог ───────
-- Запись заказов/заявок и вся админка идут через API сайта с service role key.
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.leads enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (is_published);

drop policy if exists "public read brands" on public.brands;
create policy "public read brands" on public.brands for select using (is_published);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (is_published);

-- ─── Стартовые данные ────────────────────────────────────────
insert into public.categories (slug, name, description, image_url, h1, seo_title, seo_description, seo_text, sort_order) values
  ('vanny', 'Ванны', 'Акриловые и стальные ванны Grohe, AM.PM, Cersanit. Подбор, доставка и установка.', '/photos/showroom-3.jpg',
   'Ванны в Астане', 'Ванны в Астане — купить акриловую ванну от 35 000 ₸ | SanLux',
   'Акриловые ванны в Астане по цене от 35 000 ₸. Оптом и в розницу, доставка по Казахстану, гарантия до 5 лет.',
   'Мы выполняем полный перечень работ по выбору, доставке и установке акриловых ванн различных производителей: Grohe, AM.PM, Cersanit и других. Для застройщиков и участников тендеров действуют оптовые цены — от 10 штук одной модели.', 10),
  ('rakoviny', 'Раковины', 'Раковины на пьедестале, накладные и тумбы с раковиной.', '/photos/rakoviny.jpeg',
   'Раковины для ванной в Астане', 'Раковины в Астане — купить от 25 000 ₸ | SanLux',
   'Раковины, тумбы с раковиной и раковины на пьедестале в Астане от 25 000 ₸. Опт и розница, доставка по РК.',
   'В стоимость входит бесплатный дизайн-проект. Расчёт всех работ производим в день замеров.', 20),
  ('unitazy', 'Унитазы', 'Напольные и подвесные унитазы, компакты и безободковые модели.', '/photos/unitazy.jpg',
   'Унитазы в Астане', 'Унитазы в Астане — купить от 25 000 ₸, опт и розница | SanLux',
   'Унитазы в Астане от 25 000 ₸: подвесные, напольные, безободковые. Оптом для застройщиков, доставка по Казахстану.',
   'Подберём унитаз из широкого ассортимента под ваши задачи и бюджет. Продаём оптом и в розницу, обслуживаем частных клиентов и строительные компании.', 30),
  ('smesiteli', 'Смесители', 'Смесители для ванны, раковины и кухни, душевые системы.', null,
   'Смесители в Астане', 'Смесители в Астане — для ванной и кухни | SanLux',
   'Смесители Grohe, AM.PM, Frap в Астане. Гарантия до 5 лет, оптовые цены от 10 штук.', null, 40),
  ('installyacii', 'Инсталляции', 'Инсталляции для подвесных унитазов и кнопки смыва.', null,
   'Инсталляции для унитаза в Астане', 'Инсталляции для подвесного унитаза в Астане | SanLux',
   'Инсталляции для подвесных унитазов в Астане: комплекты с кнопкой смыва, опт и розница, доставка на объект.', null, 50)
on conflict (slug) do nothing;

insert into public.brands (slug, name, logo_url, sort_order) values
  ('grohe', 'Grohe', '/brands/grohe.png', 10),
  ('gappo', 'Gappo', '/brands/gappo.jpeg', 20),
  ('saniteco', 'Saniteco', '/brands/saniteco.png', 30),
  ('triton', 'Triton', '/brands/triton.png', 40),
  ('cersanit', 'Cersanit', '/brands/cersanit.png', 50),
  ('am-pm', 'AM.PM', '/brands/ampm.png', 60),
  ('lusso', 'Lusso', '/brands/lusso.png', 70),
  ('santek', 'Santek', '/brands/santek.png', 80),
  ('1marka', '1Marka', '/brands/1marka.png', 90),
  ('santehprom', 'Сантехпром', '/brands/santehprom.png', 100),
  ('frap', 'Frap', '/brands/frap.jpeg', 110),
  ('sanita-luxe', 'Sanita Luxe', '/brands/sanita-luxe.jpg', 120)
on conflict (slug) do nothing;
