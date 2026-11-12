"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { find, migrate, quote, seed, STORAGE_KEY, transition, validate } from './demo-engine';
import type { Action, CheckoutInput, DemoState } from './demo-model';
import type { Product } from './data';
export type { CartLine, DemoOrder, OrderLine } from './demo-model';
type Result = { reference?: string; error?: string };
type Store = DemoState & { ready: boolean; storageError: string; act: (action: Action) => Result; quote: (input: CheckoutInput) => ReturnType<typeof quote>; findVariant: (id: string) => ReturnType<typeof find>; add: (id: string, quantity?: number) => boolean; setQty: (id: string, quantity: number) => boolean; remove: (id: string) => boolean; clear: () => boolean; saveProduct: (product: Product) => string | null; setArchived: (id: string, archived: boolean) => string | null; placeOrder: (input: CheckoutInput) => { reference: string } | { error: string }; setStatus: (reference: string, status: string) => string | null; exportData: () => string; importData: (raw: string) => string | null; reset: () => string | null };
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
 const [state, setState] = useState<DemoState>(seed);
 const current = useRef(state), corrupted = useRef(false);
 const [ready, setReady] = useState(false), [storageError, setStorageError] = useState('');
 useEffect(() => {
  try {
   const raw = localStorage.getItem(STORAGE_KEY), old = localStorage.getItem('la7ya-state-v2');
   const restored = raw ? migrate(JSON.parse(raw)) : old ? migrate(JSON.parse(old)) : seed();
   if (!raw && !old) { const cart = localStorage.getItem('la7ya-cart'), orders = localStorage.getItem('la7ya-orders'); if (cart || orders) { restored.cart = JSON.parse(cart || '[]'); restored.orders = JSON.parse(orders || '[]'); validate(restored); } }
   current.current = restored;
   // Initial hydration from local persistence, before interactions.
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setState(restored);
  } catch { corrupted.current = true; setStorageError('corrupt'); }
  setReady(true);
  const sync = (event: StorageEvent) => { if (event.key !== STORAGE_KEY || !event.newValue) return; try { const next = migrate(JSON.parse(event.newValue)); current.current = next; setState(next); corrupted.current = false; setStorageError(''); } catch { corrupted.current = true; setStorageError('corrupt'); } };
  window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
 }, []);
 function commit(next: DemoState, replaceCorrupt = false) {
  if (!ready) return 'loading';
  if (corrupted.current && !replaceCorrupt) return 'corrupt';
  try { validate(next); const serialized=JSON.stringify(next); if(serialized.length>4_000_000)throw new Error('QuotaExceededError'); localStorage.setItem(STORAGE_KEY, serialized); current.current = next; setState(next); corrupted.current = false; setStorageError(''); return null; }
  catch { setStorageError('storage'); return 'storage'; }
 }
 function act(action: Action): Result { try { const result = transition(current.current, action); const error = commit(result.state); return error ? { error } : { reference: result.reference }; } catch (e) { return { error: e instanceof Error ? e.message : 'invalidData' }; } }
 const boolean = (a: Action) => !act(a).error;
 return <Context.Provider value={{ ...state, ready, storageError, act, quote: input => quote(current.current, input), findVariant: id => find(state, id), add: (id, quantity = 1) => boolean({ type: 'cart', id, quantity }), setQty: (id, quantity) => boolean({ type: 'cart', id, quantity, replace: true }), remove: id => boolean({ type: 'remove', id }), clear: () => boolean({ type: 'clear' }), saveProduct: product => act({ type: 'product', product }).error || null, setArchived: (id, archived) => act({ type: 'archive', id, archived }).error || null, placeOrder: input => { const r = act({ type: 'checkout', input }); return r.reference ? { reference: r.reference } : { error: r.error || 'invalidData' }; }, setStatus: (reference, status) => act({ type: 'status', reference, status }).error || null, exportData: () => { try { return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('la7ya-state-v2') || JSON.stringify(current.current); } catch { return JSON.stringify(current.current); } }, importData: raw => { try { if (raw.length > 4_000_000) return 'invalidData'; const next = migrate(JSON.parse(raw)); next.admin = false; next.customerId = null; return commit(next, true); } catch { return 'invalidData'; } }, reset: () => commit(seed(), true) }}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('StoreProvider missing'); return value; }
