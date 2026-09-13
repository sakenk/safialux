import Link from "next/link";
import TaxonomyForm from "@/components/admin/TaxonomyForm";

export default function NewPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/brands" className="text-sm text-cobalt hover:underline">← Все бренды</Link>
        <h1 className="mt-1 text-2xl font-semibold">Новый бренд</h1>
      </div>
      <TaxonomyForm kind="brands" />
    </div>
  );
}
