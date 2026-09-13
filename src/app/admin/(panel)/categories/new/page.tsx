import Link from "next/link";
import TaxonomyForm from "@/components/admin/TaxonomyForm";

export default function NewPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/categories" className="text-sm text-cobalt hover:underline">← Все категории</Link>
        <h1 className="mt-1 text-2xl font-semibold">Новая категория</h1>
      </div>
      <TaxonomyForm kind="categories" />
    </div>
  );
}
