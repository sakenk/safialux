# SanLux — интернет-магазин сантехники

Next.js 16 (App Router) · React 19 · Tailwind 4 · Zustand · Supabase · Cloudinary. Архитектура — как у vauva.

- Покупатели заказывают **без регистрации**: корзина → имя и телефон → заказ в базе + текст заказа в WhatsApp.
- **Оптовые цены лестницей** (от 10 / 50 / 100 шт) пересчитываются в корзине и на сервере; из корзины печатается КП в PDF.
- **Админка** `/admin` (вход по паролю): заказы, заявки, товары с фото, категории, бренды.
- **SEO**: SSG/ISR, метаданные и canonical на каждой странице, JSON-LD (LocalBusiness, Product/AggregateOffer, BreadcrumbList, ItemList, FAQPage), sitemap с картинками, noindex для фильтров, 301 со старых адресов Tilda.

## Запуск

```bash
npm install
cp .env.local.example .env.local   # заполнить ключи
npm run dev
```

Без ключей Supabase сайт работает в **демо-режиме**: демо-каталог, заказы не сохраняются, админка только читает.

## Подключение

1. **Supabase** — создать проект, открыть SQL Editor, выполнить `supabase/migrations/0001_init.sql` (таблицы, RLS, 5 категорий и 12 брендов). В `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Cloudinary** — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (фото кладутся в папку `sanlux/`).
3. **Админка** — `ADMIN_PASSWORD` и длинный случайный `ADMIN_SESSION_SECRET`.
4. **Уведомления о заказах в Telegram** (необязательно, но рекомендуется) — `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`, инструкция в `.env.local.example`. При каждом заказе (в том числе в демо-режиме) бот присылает состав, сумму, контакты и адрес доставки, если она нужна — без этого узнать о заказе можно только зайдя в `/admin/orders`.
5. **SEO** — `NEXT_PUBLIC_SITE_URL=https://sanlux.kz`; коды подтверждения Google Search Console и Яндекс.Вебмастера — в `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_YANDEX_VERIFICATION`.

## Где что лежит

| Путь | Что |
|---|---|
| `src/lib/site.ts` | телефоны, WhatsApp, адрес, часы, порог «крупного заказа» |
| `src/lib/content.ts` | тексты главной, FAQ, блок опта |
| `src/lib/data.ts` | чтение каталога с кэшем (тег `catalog`, сбрасывается при сохранении в админке) |
| `src/lib/seo.ts` | метаданные и JSON-LD |
| `src/app/(site)` | витрина |
| `src/app/admin`, `src/app/api/admin` | админка и её API |
| `scripts/fetch-tilda-assets.mjs` | повторно скачать логотип, фото и логотипы брендов с Tilda |
