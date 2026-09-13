"use client";

import { useRef, useState } from "react";
import SmartImage from "@/components/SmartImage";
import { uploadImage } from "./api";

type Img = { url: string; alt?: string };

/** Несколько фото: первое — главное. Можно загрузить файлы или вставить ссылку. */
export default function ImageUploader({
  value,
  onChange,
  folder,
  multiple = true,
}: {
  value: Img[];
  onChange: (images: Img[]) => void;
  folder: "products" | "categories" | "brands";
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = multiple ? [...files] : [files[0]];
    setUploading(list.length);
    const uploaded: Img[] = [];
    for (const file of list) {
      try {
        uploaded.push({ url: await uploadImage(file, folder) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
      }
      setUploading((n) => n - 1);
    }
    onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((img, i) => (
            <li key={img.url + i} className="w-32">
              <div className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-glaze ${i === 0 && multiple ? "border-cobalt" : "border-grout"}`}>
                <SmartImage src={img.url} alt="" fill sizes="128px" className="object-cover" />
                {i === 0 && multiple && <span className="absolute left-1 top-1 rounded bg-cobalt px-1.5 text-[10px] text-white">Главное</span>}
              </div>
              <div className="mt-1 flex justify-between text-xs">
                {multiple ? (
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1.5 hover:bg-glaze disabled:opacity-30" aria-label="Левее">←</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded px-1.5 hover:bg-glaze disabled:opacity-30" aria-label="Правее">→</button>
                  </span>
                ) : <span />}
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-danger hover:underline">Удалить</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} onChange={(e) => handleFiles(e.target.files)} className="hidden" id={`upload-${folder}`} />
        <label htmlFor={`upload-${folder}`} className={`btn btn-ghost btn-sm cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? `Загружаем… (${uploading})` : multiple ? "Загрузить фото" : value.length ? "Заменить фото" : "Загрузить фото"}
        </label>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="или вставьте ссылку https://…" className="field !min-h-10 max-w-xs !py-2 text-sm" aria-label="Ссылка на фото" />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={!/^https:\/\/|^\//.test(link)}
          onClick={() => {
            onChange(multiple ? [...value, { url: link.trim() }] : [{ url: link.trim() }]);
            setLink("");
          }}
        >
          Добавить
        </button>
      </div>
      <p className="text-xs text-chrome">JPG, PNG, WebP до 10 МБ. Лучше квадратные фото на светлом фоне от 1200 px.</p>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}
