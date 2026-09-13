import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";
import { adminBrands, adminCategories, adminProducts } from "@/lib/admin-data";

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([adminProducts(), adminCategories(), adminBrands()]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Товары</h1>
          <p className="text-sm text-chrome">{products.length} в каталоге, из них скрыто: {products.filter((p) => !p.is_published).length}</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">+ Добавить товар</Link>
      </div>
      <ProductsTable
        products={products}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
