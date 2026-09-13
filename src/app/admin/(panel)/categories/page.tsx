import TaxonomyList from "@/components/admin/TaxonomyList";
import { adminCategories, adminProducts } from "@/lib/admin-data";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([adminCategories(), adminProducts()]);
  return (
    <TaxonomyList
      title="Категории"
      kind="categories"
      addLabel="+ Добавить категорию"
      publicPath="/catalog/"
      rows={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image_url,
        count: products.filter((p) => p.category_id === c.id).length,
        sort_order: c.sort_order,
        is_published: c.is_published,
      }))}
    />
  );
}
