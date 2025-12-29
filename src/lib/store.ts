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
// Selectors
export const useLanguage = () => useAppStore((s) => s.language);
export const useDirection = () => useAppStore((s) => s.direction);
export const useToggleLanguage = () => useAppStore((s) => state.toggleLanguage);