import { create } from 'zustand';
interface AppState {
  language: 'en' | 'fa';
  direction: 'ltr' | 'rtl';
  timezone: string;
  setLanguage: (lang: 'en' | 'fa') => void;
  setTimezone: (tz: string) => void;
  toggleLanguage: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  language: (localStorage.getItem('language') as 'en' | 'fa') || 'en',
  direction: (localStorage.getItem('language') === 'fa' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
  timezone: localStorage.getItem('timezone') || 'UTC',
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({
      language: lang,
      direction: lang === 'fa' ? 'rtl' : 'ltr'
    });
  },
  setTimezone: (tz) => {
    localStorage.setItem('timezone', tz);
    set({ timezone: tz });
  },
  toggleLanguage: () => set((state) => {
    const nextLang = state.language === 'en' ? 'fa' : 'en';
    localStorage.setItem('language', nextLang);
    return {
      language: nextLang,
      direction: nextLang === 'fa' ? 'rtl' : 'ltr'
    };
  }),
}));
/**
 * ZUSTAND ZERO-TOLERANCE SELECTORS
 */
export const useLanguage = () => useAppStore((s) => s.language);
export const useDirection = () => useAppStore((s) => s.direction);
export const useTimezone = () => useAppStore((s) => s.timezone);
export const useSetTimezone = () => useAppStore((s) => s.setTimezone);
export const useToggleLanguage = () => useAppStore((s) => s.toggleLanguage);
export const useSetLanguage = () => useAppStore((s) => s.setLanguage);