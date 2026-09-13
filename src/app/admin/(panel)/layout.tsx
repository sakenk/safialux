import AdminNav from "@/components/admin/AdminNav";
import { adminCounters } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/admin-guard";
import { isAdminDbConfigured } from "@/lib/supabase";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  const counters = await adminCounters().catch(() => ({ newOrders: 0, newLeads: 0 }));

  return (
    <>
      <AdminNav newOrders={counters.newOrders} newLeads={counters.newLeads} />
      {!isAdminDbConfigured && (
        <div className="bg-brass px-4 py-2 text-center text-sm text-white print:hidden">
          Демо-режим: данные только для просмотра. Добавьте ключи Supabase в .env.local, чтобы сохранять изменения.
        </div>
      )}
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 print:max-w-none print:p-0">{children}</main>
    </>
  );
}
