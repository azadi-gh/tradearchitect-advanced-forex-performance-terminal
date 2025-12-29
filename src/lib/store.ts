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
// Selectors follow ZUSTAND ZERO-TOLERANCE RULE
// Note: We use functions that call the store to ensure they are used as hooks correctly
export const useLanguage = () => useAppStore((s) => s.language);
export const useDirection = () => useAppStore((s) => s.direction);
export const useToggleLanguage = () => useAppStore((s) => s.toggleLanguage);