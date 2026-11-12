"use client";

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Each streamed consumer must hydrate its own server snapshot, even if its
// parent provider already restored browser data before this consumer arrived.
export function useHydrated() {
 return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
