"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true только на клиенте — корзина из localStorage не ломает гидрацию. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
