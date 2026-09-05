import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEYS = {
  THEME: 'ZeroTierForKSU.theme',
  LOCALE: 'ZeroTierForKSU.locale',
  DEBUG_MODE: 'ZeroTierForKSU.debugMode',
  NODE_ID: 'ZeroTierForKSU.nodeId',
  MEMBER_NAMES: 'ZeroTierForKSU.member_names',
} as const;

export function getStorageItem(key: string, ...fallbackKeys: string[]): string | null {
  if (typeof localStorage === 'undefined') return null;
  const val = localStorage.getItem(key);
  if (val !== null) return val;
  for (const fallbackKey of fallbackKeys) {
    if (!fallbackKey) continue;
    const fallbackVal = localStorage.getItem(fallbackKey);
    if (fallbackVal !== null) {
      try {
        localStorage.setItem(key, fallbackVal);
      } catch {}
      return fallbackVal;
    }
  }
  return null;
}
