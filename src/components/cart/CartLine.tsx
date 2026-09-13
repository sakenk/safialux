"use client";

import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { IconTrash } from "@/components/icons";
import { formatPrice, nextTier } from "@/lib/pricing";
import { lineUnitPrice, useCart, type CartItem } from "@/store/cart";
import QuantityInput from "./QuantityInput";

export default function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const unit = lineUnitPrice(item);
  const upcoming = nextTier(item.wholesalePrices, item.quantity);

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/product/${item.slug}`} onClick={onNavigate} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-glaze">
        {item.image && <SmartImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${item.slug}`} onClick={onNavigate} className="line-clamp-2 text-[15px] font-medium leading-snug hover:text-cobalt">
            {item.name}
          </Link>
          <button type="button" onClick={() => remove(item.productId)} className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-chrome hover:bg-glaze hover:text-danger" aria-label={`Удалить ${item.name}`}>
            <IconTrash width={17} height={17} />
          </button>
        </div>
        {item.sku && <p className="font-mono text-xs text-chrome">арт. {item.sku}</p>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <QuantityInput size="sm" value={item.quantity} onChange={(q) => setQuantity(item.productId, q)} />
          <div className="text-right">
            <p className="font-semibold">{formatPrice(unit * item.quantity)}</p>
            <p className={`text-xs ${unit < item.price ? "text-brass" : "text-chrome"}`}>
              {formatPrice(unit)} / шт{unit < item.price ? " · оптовая" : ""}
            </p>
          </div>
        </div>
        {upcoming && (
          <button
            type="button"
            onClick={() => setQuantity(item.productId, upcoming.min_qty)}
            className="mt-2 text-left text-xs text-brass underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            От {upcoming.min_qty} шт — {formatPrice(upcoming.price)} за штуку
          </button>
        )}
      </div>
    </li>
  );
}
