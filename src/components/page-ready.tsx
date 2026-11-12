"use client";

import { useSyncExternalStore, type ReactNode } from 'react';
import { useStore } from '@/lib/store';
import { useMarket } from './market-context';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// This gate belongs to each route segment, not to the shared application shell.
// A streamed page must hydrate its own loading markup even when the parent store
// has already restored localStorage while that page was still being downloaded.
export function PageReady({ children }: { children: ReactNode }) {
 const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
 const { ready } = useStore();
 const { t } = useMarket();
 return hydrated && ready ? children : <div className="m-loading" role="status">{t('Chargement de votre boutique…', 'جارٍ تحميل المتجر…')}</div>;
}
