import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
import { STORAGE_KEYS, getStorageItem } from '@/lib/utils';

register('en', () => import('./locales/en.json'));
register('zh', () => import('./locales/zh.json'));

function getInitialLocale() {
  const saved = getStorageItem(STORAGE_KEYS.LOCALE, 'ZerotierForKSU.locale');
  if (saved) return saved;

  const browserLocale = getLocaleFromNavigator();
  if (browserLocale?.startsWith('zh')) return 'zh';
  if (browserLocale?.startsWith('en')) return 'en';

  return 'zh'; // Default to Chinese if no match
}

init({
  fallbackLocale: 'zh',
  initialLocale: getInitialLocale(),
});
