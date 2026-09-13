"use client";

import { useState } from "react";
import { MAX_QTY } from "@/store/cart";

export default function QuantityInput({
  value,
  onChange,
  size = "md",
  label = "Количество",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-9" : "w-12";

  function commit(raw: string) {
    const n = Math.floor(Number(raw.replace(/\D/g, "")));
    onChange(Math.min(MAX_QTY, Math.max(1, n || 1)));
    setDraft(null);
  }

  return (
    <div className={`inline-flex items-stretch overflow-hidden rounded-full border border-grout bg-porcelain ${h}`}>
      <button type="button" className={`${w} text-lg text-ink-soft hover:bg-glaze disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Уменьшить">
        −
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        className="w-14 bg-transparent text-center font-mono text-[15px] outline-none"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 4))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
      />
      <button type="button" className={`${w} text-lg text-ink-soft hover:bg-glaze disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Увеличить">
        +
      </button>
    </div>
  );
}
