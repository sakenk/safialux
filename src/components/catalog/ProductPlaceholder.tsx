export default function ProductPlaceholder({ label }: { label?: string }) {
  return (
    <div className="tile-grid absolute inset-0 grid place-items-center [background-size:32px_32px]">
      <div className="flex flex-col items-center gap-2 text-chrome">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M8 26h40v6a14 14 0 0 1-14 14H22A14 14 0 0 1 8 32z" />
          <path d="M14 26V12a4 4 0 0 1 8 0" />
          <path d="M20 46l-3 5M36 46l3 5" />
        </svg>
        <span className="font-mono text-[11px] uppercase tracking-wider">{label ?? "Фото скоро"}</span>
      </div>
    </div>
  );
}
