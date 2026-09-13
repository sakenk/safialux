"use client";

import { useEffect, useState } from "react";
import SmartImage from "@/components/SmartImage";
import ProductPlaceholder from "@/components/catalog/ProductPlaceholder";
import { IconClose } from "@/components/icons";
import type { ProductImage } from "@/lib/types";

export default function Gallery({ images, name, label }: { images: ProductImage[]; name: string; label?: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[active];

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, images.length]);

  if (!current) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[28px] border border-grout bg-glaze">
        <ProductPlaceholder label={label} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[28px] border border-grout bg-porcelain"
        aria-label="Открыть фото крупно"
      >
        <SmartImage
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
        />
      </button>

      {images.length > 1 && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img.url + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === active}
                className={`relative block size-20 overflow-hidden rounded-xl border-2 bg-porcelain ${i === active ? "border-cobalt" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <SmartImage src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={name} className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4" onClick={() => setZoom(false)}>
          <button type="button" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Закрыть">
            <IconClose />
          </button>
          <div className="relative h-[85vh] w-full max-w-5xl">
            <SmartImage src={current.url} alt={current.alt || name} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
