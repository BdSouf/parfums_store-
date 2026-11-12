"use client";

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useMarket } from './market-context';

type Theme = 'light' | 'dark';
const listeners = new Set<() => void>();
const snapshot = (): Theme => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
const serverSnapshot = (): Theme => 'light';
const notify = () => listeners.forEach(listener => listener());
const onStorage = (event: StorageEvent) => {
 if (event.key !== 'la7ya-theme' && event.key !== null) return;
 const theme = event.newValue === 'dark' ? 'dark' : 'light';
 document.documentElement.dataset.theme = theme;
 document.documentElement.style.colorScheme = theme;
 notify();
};
const subscribe = (listener: () => void) => {
 listeners.add(listener);
 if (listeners.size === 1) window.addEventListener('storage', onStorage);
 return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener('storage', onStorage); };
};

export function ThemeToggle() {
 const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot), { t } = useMarket();
 const label = theme === 'light' ? t('Activer le mode sombre', 'تفعيل الوضع الداكن') : t('Activer le mode clair', 'تفعيل الوضع الفاتح');
 return <button type="button" className="theme-toggle heritage-icon" aria-label={label} title={label} onClick={() => {
  const next = theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  try { localStorage.setItem('la7ya-theme', next); } catch { /* The theme still works when browser storage is unavailable. */ }
  notify();
 }}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>;
}
