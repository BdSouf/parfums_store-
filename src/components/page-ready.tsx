"use client";

import { type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { useMarket } from './market-context';
import { useHydrated } from './use-hydrated';

// This gate belongs to each route segment, not to the shared application shell.
// A streamed page must hydrate its own loading markup even when the parent store
// has already restored localStorage while that page was still being downloaded.
export function PageReady({ children }: { children: ReactNode }) {
 const hydrated = useHydrated();
 const { ready } = useStore();
 const { t } = useMarket();
 return hydrated && ready ? children : <div className="m-loading" role="status">{t('Chargement de votre boutique…', 'جارٍ تحميل المتجر…')}</div>;
}
