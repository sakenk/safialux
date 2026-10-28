import Link from "next/link";
import ProductsImport from "@/components/admin/ProductsImport";
import { adminBrands, adminCategories } from "@/lib/admin-data";

export default async function ImportProductsPage() {
  const [categories, brands] = await Promise.all([adminCategories(), adminBrands()]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-cobalt hover:underline">← Все товары</Link>
        <h1 className="mt-1 text-2xl font-semibold">Импорт товаров из CSV</h1>
        <p className="mt-1 text-sm text-chrome">
          Колонки: slug, category_slug, brand_slug, name, sku, description, price, old_price, wholesale_10, wholesale_50,
          specs (Название=значение; через точку с запятой), in_stock, is_featured, is_new, is_sale, image_urls, meta_title,
          meta_description. Категории: {categories.map((c) => c.slug).join(", ") || "нет"}.
        </p>
      </div>
      <ProductsImport
        categories={categories.map((c) => ({ id: c.id, slug: c.slug }))}
        brands={brands.map((b) => ({ id: b.id, slug: b.slug }))}
      />
    </div>
  );
}
