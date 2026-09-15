"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { IconClose, IconSearch } from "@/components/icons";
import { useSearch } from "@/store/search";

export default function MobileSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useSearch((s) => s.isOpen);
  const closeSearch = useSearch((s) => s.closeSearch);
  const inputRef = useRef<HTMLInputElement>(null);

  // Закрываем панель при переходе на другую страницу
  useEffect(() => {
    closeSearch();
  }, [pathname, closeSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const input = inputRef.current;
    if (input) {
      input.value = new URLSearchParams(window.location.search).get("q") ?? "";
      input.focus();
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeSearch]);

  return (
    <div className="md:hidden">
      {isOpen && (
        <div id="mobile-search" className="absolute inset-x-0 top-full border-b border-grout bg-porcelain shadow-sm">
          <form
            action="/catalog"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = inputRef.current?.value.trim();
              if (!q) return inputRef.current?.focus();
              inputRef.current?.blur();
              closeSearch();
              router.push(`/catalog?q=${encodeURIComponent(q)}`);
            }}
            className="container-x flex items-center gap-2 py-3"
          >
            <div className="relative flex-1">
              <label htmlFor="mobile-search-input" className="sr-only">Поиск по каталогу</label>
              <input
                ref={inputRef}
                id="mobile-search-input"
                name="q"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Унитаз, ванна 170, артикул…"
                className="field !min-h-11 !rounded-full !pl-11"
              />
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-chrome" />
            </div>
            <button type="button" onClick={closeSearch} aria-label="Закрыть поиск" className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft">
              <IconClose />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
