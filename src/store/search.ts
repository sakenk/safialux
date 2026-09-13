"use client";

import { create } from "zustand";

interface SearchState {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

// Мобильная панель поиска: открывается из шапки и из нижней панели
export const useSearch = create<SearchState>()((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  toggleSearch: () => set((s) => ({ isOpen: !s.isOpen })),
}));
