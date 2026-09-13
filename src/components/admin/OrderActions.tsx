"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { adminRequest } from "./api";
import { ORDER_STATUS } from "./labels";

export default function OrderActions({ id, status, note }: { id: string; status: OrderStatus; note: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(note);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function save(patch: Record<string, unknown>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      await adminRequest(`/api/admin/orders/${id}`, "PATCH", patch);
      setMessage({ kind: "ok", text: okText });
      router.refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Не удалось сохранить" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-grout bg-porcelain p-5 text-sm">
      <h2 className="font-sans text-base font-semibold tracking-normal">Статус</h2>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || s === status}
            onClick={() => save({ status: s }, `Статус: ${ORDER_STATUS[s].label}`)}
            className={`h-10 rounded-xl border text-sm font-medium ${s === status ? "border-ink bg-ink text-white" : "border-grout hover:border-ink"} disabled:cursor-default`}
          >
            {ORDER_STATUS[s].label}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="label">Заметка менеджера</span>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} className="field resize-y" placeholder="Договорились о доставке в пятницу, счёт отправлен" />
      </label>
      <button type="button" disabled={busy || draft === note} onClick={() => save({ admin_note: draft }, "Заметка сохранена")} className="btn btn-primary btn-sm w-full">
        Сохранить заметку
      </button>
      {message && <p className={message.kind === "ok" ? "text-success" : "text-danger"} role="status">{message.text}</p>}
    </section>
  );
}
