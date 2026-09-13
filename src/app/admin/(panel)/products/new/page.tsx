import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { adminBrands, adminCategories } from "@/lib/admin-data";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([adminCategories(), adminBrands()]);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-cobalt hover:underline">← Все товары</Link>
        <h1 className="mt-1 text-2xl font-semibold">Новый товар</h1>
      </div>
      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-grout bg-porcelain p-8 text-ink-soft">
          Сначала <Link href="/admin/categories/new" className="text-cobalt hover:underline">создайте категорию</Link> — товар должен в неё входить.
        </p>
      ) : (
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        />
      )}
    </div>
  );
}
