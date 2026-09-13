"use client";

import { useState } from "react";
import { formatPhoneInput } from "@/lib/text";

type Status = "idle" | "sending" | "sent" | "error";

export default function LeadForm({
  source,
  productId,
  withCompany = false,
  withMessage = false,
  messagePlaceholder = "Что нужно подобрать",
  submitLabel = "Отправить заявку",
  dark = false,
}: {
  source: string;
  productId?: string;
  withCompany?: boolean;
  withMessage?: boolean;
  messagePlaceholder?: string;
  submitLabel?: string;
  dark?: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [loadedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone,
          company_name: form.get("company_name"),
          message: form.get("message"),
          website: form.get("website"),
          source,
          product_id: productId,
          formLoadedAt: loadedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось отправить заявку");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    }
  }

  if (status === "sent") {
    return (
      <div className={`rounded-[var(--radius-card)] p-6 ${dark ? "bg-white/10 text-white" : "bg-cobalt-wash"}`} role="status">
        <p className="font-display text-xl">Заявка принята</p>
        <p className={`mt-2 ${dark ? "text-white/70" : "text-ink-soft"}`}>
          Перезвоним в рабочее время в течение 15 минут. Если срочно — позвоните или напишите в WhatsApp.
        </p>
      </div>
    );
  }

  const fieldClass = dark ? "field !border-white/15 !bg-white/5 !text-white placeholder:!text-white/40" : "field";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate={false}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required autoComplete="name" placeholder="Имя" aria-label="Имя" className={fieldClass} maxLength={80} />
        <input
          name="phone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          aria-label="Телефон"
          className={fieldClass}
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
          title="Номер в формате +7 (707) 444-72-71"
        />
      </div>
      {withCompany && (
        <input name="company_name" placeholder="Компания или объект (необязательно)" aria-label="Компания" className={fieldClass} maxLength={120} />
      )}
      {withMessage && (
        <textarea name="message" rows={4} placeholder={messagePlaceholder} aria-label="Сообщение" className={`${fieldClass} resize-y`} maxLength={3000} />
      )}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" ? "Отправляем…" : submitLabel}
      </button>
      {status === "error" && <p className="text-sm text-danger" role="alert">{error}</p>}
      <p className={`text-xs ${dark ? "text-white/40" : "text-chrome"}`}>
        Нажимая кнопку, вы соглашаетесь на обработку контактных данных для связи по заявке.
      </p>
    </form>
  );
}
