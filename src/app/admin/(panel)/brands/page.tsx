import TaxonomyList from "@/components/admin/TaxonomyList";
import { adminBrands, adminProducts } from "@/lib/admin-data";

export default async function AdminBrandsPage() {
  const [brands, products] = await Promise.all([adminBrands(), adminProducts()]);
  return (
    <TaxonomyList
      title="Бренды"
      kind="brands"
      addLabel="+ Добавить бренд"
      publicPath="/brand/"
      rows={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        image: b.logo_url,
        count: products.filter((p) => p.brand_id === b.id).length,
        sort_order: b.sort_order,
        is_published: b.is_published,
      }))}
    />
  );
}
