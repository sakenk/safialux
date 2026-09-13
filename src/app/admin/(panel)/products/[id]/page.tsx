import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { adminBrands, adminCategories, adminProduct } from "@/lib/admin-data";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const [product, categories, brands] = await Promise.all([adminProduct(id), adminCategories(), adminBrands()]);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-sm text-cobalt hover:underline">← Все товары</Link>
        <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
        {created && <p className="mt-1 text-sm text-success">Товар создан и опубликован. Можно продолжить редактирование.</p>}
      </div>
      <ProductForm
        product={{ ...product, price: Number(product.price) }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
