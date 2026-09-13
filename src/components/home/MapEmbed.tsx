"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/** Карта грузится только по клику — не тормозит страницу и не тянет сторонние скрипты. */
export default function MapEmbed() {
  const [show, setShow] = useState(false);
  const { lat, lng } = SITE.geo;
  const src = `https://yandex.kz/map-widget/v1/?ll=${lng}%2C${lat}&z=16&pt=${lng}%2C${lat}%2Cpm2blm&lang=ru_RU`;

  return (
    <div className="relative min-h-80 bg-glaze">
      {show ? (
        <iframe src={src} title="SanLux на карте" className="absolute inset-0 h-full w-full border-0" loading="lazy" allowFullScreen />
      ) : (
        <div className="tile-grid absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-chrome">
            {lat.toFixed(4)}° N · {lng.toFixed(4)}° E
          </p>
          <p className="max-w-xs text-ink-soft">{SITE.address.street}, {SITE.address.detail}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setShow(true)} className="btn btn-dark btn-sm">Показать карту</button>
            <a
              href={`https://2gis.kz/astana/search/${encodeURIComponent(`${SITE.address.street} Астана`)}`}
              target="_blank"
              rel="noopener"
              className="btn btn-ghost btn-sm"
            >
              Открыть в 2ГИС
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
