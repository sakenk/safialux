"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { unitPriceFor } from "@/lib/pricing";
import type { PriceTier } from "@/lib/types";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  sku: string | null;
  image: string | null;
  price: number;
  wholesalePrices: PriceTier[];
  quantity: number;
}

export const MAX_QTY = 9999;

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, ...item, quantity: clampQty(i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: clampQty(quantity) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity: clampQty(quantity) } : i)),
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    { name: "sanlux-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

export function lineUnitPrice(item: CartItem) {
  return unitPriceFor(item.price, item.wholesalePrices, item.quantity);
}

export function cartTotals(items: CartItem[]) {
  let total = 0;
  let retailTotal = 0;
  let count = 0;
  for (const item of items) {
    total += lineUnitPrice(item) * item.quantity;
    retailTotal += item.price * item.quantity;
    count += item.quantity;
  }
  return { total, retailTotal, savings: retailTotal - total, count };
}
