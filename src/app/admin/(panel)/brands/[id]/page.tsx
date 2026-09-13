import Link from "next/link";
import { notFound } from "next/navigation";
import TaxonomyForm from "@/components/admin/TaxonomyForm";
import { adminBrand } from "@/lib/admin-data";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await adminBrand(id);
  if (!item) notFound();
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/brands" className="text-sm text-cobalt hover:underline">← Все бренды</Link>
        <h1 className="mt-1 text-2xl font-semibold">{item.name}</h1>
      </div>
      <TaxonomyForm kind="brands" item={item} />
    </div>
  );
}
