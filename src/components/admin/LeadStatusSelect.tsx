"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LeadStatus } from "@/lib/types";
import { adminRequest } from "./api";
import { LEAD_STATUS } from "./labels";

export default function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  async function change(next: LeadStatus) {
    const prev = value;
    setValue(next);
    setBusy(true);
    try {
      await adminRequest(`/api/admin/leads/${id}`, "PATCH", { status: next });
      router.refresh();
    } catch (err) {
      setValue(prev);
      alert(err instanceof Error ? err.message : "Не удалось сменить статус");
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      aria-label="Статус заявки"
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as LeadStatus)}
      className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${LEAD_STATUS[value].className}`}
    >
      {Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
    </select>
  );
}
