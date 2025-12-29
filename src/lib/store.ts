import React from 'react';
import { create } from 'zustand';
interface AppState {
  language: 'en' | 'fa';
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: 'en' | 'fa') => void;
  toggleLanguage: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  direction: 'ltr',
  setLanguage: (lang) => set({
    language: lang,
    direction: lang === 'fa' ? 'rtl' : 'ltr'
  }),
  toggleLanguage: () => set((state) => {
    const nextLang = state.language === 'en' ? 'fa' : 'en';
    return {
      language: nextLang,
      direction: nextLang === 'fa' ? 'rtl' : 'ltr'
    };
  }),
}));
/**
 * ZUSTAND ZERO-TOLERANCE SELECTORS
 * Each hook returns a primitive value to prevent re-render loops and ensure terminal stability.
 */
export const useLanguage = () => useAppStore((s) => s.language);
export const useDirection = () => useAppStore((s) => s.direction);
export const useToggleLanguage = () => useAppStore((s) => s.toggleLanguage);
export const useSetLanguage = () => useAppStore((s) => s.setLanguage);