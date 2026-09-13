"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/store/cart";
import { IconCart, IconCheck } from "@/components/icons";

export default function AddToCartButton({
  item,
  quantity = 1,
  compact = false,
  className = "",
}: {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  compact?: boolean;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(item, quantity);
    setAdded(true);
    if (!compact) openDrawer();
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn w-full ${compact ? "btn-sm" : ""} ${added ? "bg-success text-white" : compact ? "btn-ghost" : "btn-primary"} ${className}`}
      aria-live="polite"
    >
      {added ? <IconCheck width={18} height={18} /> : <IconCart width={18} height={18} />}
      {added ? "В корзине" : "В корзину"}
    </button>
  );
}
