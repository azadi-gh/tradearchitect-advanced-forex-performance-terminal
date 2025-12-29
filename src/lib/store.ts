import { create } from 'zustand';
interface AppState {
  language: 'en' | 'fa';
  direction: 'ltr' | 'rtl';
  timezone: string;
  setLanguage: (lang: 'en' | 'fa') => void;
  setTimezone: (tz: string) => void;
  toggleLanguage: () => void;
}
const getInitialTimezone = () => {
  const saved = localStorage.getItem('timezone');
  if (saved) return saved;
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Auto-detect Iran
    if (detected === 'Asia/Tehran' || detected.includes('Tehran')) {
      return 'Asia/Tehran';
    }
    return detected || 'UTC';
  } catch (e) {
    return 'UTC';
  }
};
export const useAppStore = create<AppState>((set) => ({
  language: (localStorage.getItem('language') as 'en' | 'fa') || 'en',
  direction: (localStorage.getItem('language') === 'fa' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
  timezone: getInitialTimezone(),
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
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
    document.documentElement.setAttribute('dir', nextLang === 'fa' ? 'rtl' : 'ltr');
    // Add a transition hint class to body
    document.body.classList.add('switching-language');
    setTimeout(() => document.body.classList.remove('switching-language'), 500);
    return {
      language: nextLang,
      direction: nextLang === 'fa' ? 'rtl' : 'ltr'
    };
  }),
}));
/**
 * ZUSTAND ZERO-TOLERANCE SELECTORS - ALWAYS PRIMITIVE
 */
export const useLanguage = () => useAppStore((s) => s.language);
export const useDirection = () => useAppStore((s) => s.direction);
export const useTimezone = () => useAppStore((s) => s.timezone);
export const useSetTimezone = () => useAppStore((s) => s.setTimezone);
export const useToggleLanguage = () => useAppStore((s) => s.toggleLanguage);
export const useSetLanguage = () => useAppStore((s) => s.setLanguage);
/**
 * Localized Timezone Label Helper
 */
export const getTimezoneLabel = (tzValue: string, lang: 'en' | 'fa') => {
  const labels: Record<string, Record<'en' | 'fa', string>> = {
    'UTC': { en: 'UTC (GMT+0)', fa: 'وقت جهانی (UTC)' },
    'Europe/London': { en: 'London (GMT/BST)', fa: 'لندن' },
    'America/New_York': { en: 'New York (EST/EDT)', fa: 'نیویورک' },
    'Asia/Tokyo': { en: 'Tokyo (JST)', fa: 'توکیو' },
    'Australia/Sydney': { en: 'Sydney (AEST/AEDT)', fa: 'سیدنی' },
    'Asia/Tehran': { en: 'Tehran (GMT+3:30)', fa: 'تهران (ایران)' },
  };
  return labels[tzValue]?.[lang] || tzValue;
};