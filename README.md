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

Полный порядок действий — база данных, миграция, переменные окружения, деплой, безопасность — в [`DEPLOY.md`](./DEPLOY.md).

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
