"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { products as initialProducts, variantVolumeMl, type Product, type Variant } from "./data";
import { productError } from "./catalog";

export type CartLine = { variantId: string; quantity: number };
export type OrderLine = CartLine & { productName?: string; brand?: string; variantLabel?: string; kind?: Variant["kind"]; unitPrice?: number; image?: string };
export type DemoOrder = { reference: string; name: string; phone: string; city: string; address: string; delivery: string; total: number; status: string; createdAt: string; items: OrderLine[]; inventoryManaged?: boolean };
type OrderInput = Pick<DemoOrder, "name" | "phone" | "city" | "address" | "delivery">;
type State = { products: Product[]; cart: CartLine[]; orders: DemoOrder[] };
type Lookup = { product: Product; variant: Variant } | undefined;
type Store = State & {
  ready: boolean; storageError: string; findVariant: (id: string) => Lookup;
  add: (id: string, quantity?: number) => boolean; setQty: (id: string, quantity: number) => boolean;
  remove: (id: string) => boolean; clear: () => boolean;
  saveProduct: (product: Product) => string | null; setArchived: (id: string, archived: boolean) => string | null;
  placeOrder: (input: OrderInput) => { reference: string } | { error: string };
  setStatus: (reference: string, status: string) => string | null;
};
const key = "la7ya-state-v2";
const emptyState: State = { products: initialProducts, cart: [], orders: [] };
const statuses = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];
const Context = createContext<Store | null>(null);
const lookup = (products: Product[], id: string): Lookup => {
  for (const product of products) { const variant = product.variants.find(item => item.id === id); if (variant) return { product, variant }; }
};
function validLine(line: CartLine) { return typeof line?.variantId === "string" && Number.isInteger(line.quantity) && line.quantity > 0; }
function validState(value: State) {
  try {
    return Array.isArray(value.products) && value.products.every(product => !productError(product)) &&
      new Set(value.products.map(product => product.id)).size === value.products.length &&
      new Set(value.products.map(product => product.slug)).size === value.products.length &&
      new Set(value.products.flatMap(product => product.variants.map(variant => variant.id))).size === value.products.reduce((sum, product) => sum + product.variants.length, 0) &&
      Array.isArray(value.cart) && value.cart.every(validLine) && new Set(value.cart.map(line => line.variantId)).size === value.cart.length &&
      Array.isArray(value.orders) && value.orders.every(order => [order.reference, order.name, order.phone, order.city, order.address, order.delivery, order.status, order.createdAt].every(field => typeof field === "string") && Number.isFinite(order.total) && Array.isArray(order.items) && order.items.every(validLine));
  } catch { return false; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(emptyState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      const restored: State = saved ? JSON.parse(saved) : { products: initialProducts, cart: JSON.parse(localStorage.getItem("la7ya-cart") || "[]"), orders: JSON.parse(localStorage.getItem("la7ya-orders") || "[]") };
      if (!validState(restored)) throw new Error("Données invalides");
      restored.orders = restored.orders.map(order => ({ ...order, items: order.items.map(line => {
        const found = lookup(restored.products, line.variantId);
        return found ? { productName: found.product.name, brand: found.product.brand, variantLabel: found.variant.label, kind: found.variant.kind, unitPrice: found.variant.price, image: found.product.image, ...line } : line;
      }) }));
      current.current = restored;
      // Chargement initial des données locales, avant toute interaction.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(restored);
    } catch {
      setStorageError("Les données locales sont illisibles ou le stockage est indisponible. Les données de départ sont affichées ; aucune ancienne donnée n’a été supprimée.");
    }
    setReady(true);
    function sync(event: StorageEvent) {
      if (event.key !== key || !event.newValue) return;
      try {
        const next: State = JSON.parse(event.newValue);
        if (validState(next)) { current.current = next; setState(next); }
      } catch { /* Une sauvegarde illisible ne remplace pas les données en cours. */ }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function commit(next: State): string | null {
    if (!ready) return "Le catalogue est encore en cours de chargement.";
    try {
      localStorage.setItem(key, JSON.stringify(next));
      current.current = next; setState(next); setStorageError("");
      return null;
    } catch {
      const error = "Enregistrement impossible : le stockage du navigateur est plein ou désactivé. Réessayez avec une image plus légère. Votre modification n’a pas été appliquée.";
      setStorageError(error); return error;
    }
  }
  function add(id: string, quantity = 1) {
    const value = current.current, found = lookup(value.products, id);
    if (!found || found.product.archived || !Number.isInteger(quantity) || quantity < 1) return false;
    const existing = value.cart.find(line => line.variantId === id);
    const total = (existing?.quantity || 0) + quantity;
    if (total > found.variant.stock) return false;
    const cart = existing ? value.cart.map(line => line.variantId === id ? { ...line, quantity: total } : line) : [...value.cart, { variantId: id, quantity }];
    return !commit({ ...value, cart });
  }
  function setQty(id: string, quantity: number) {
    const value = current.current, found = lookup(value.products, id);
    if (!found || found.product.archived || !Number.isInteger(quantity) || quantity < 1 || quantity > found.variant.stock) return false;
    return !commit({ ...value, cart: value.cart.map(line => line.variantId === id ? { ...line, quantity } : line) });
  }
  function saveProduct(product: Product) {
    const error = productError(product); if (error) return error;
    const value = current.current, existing = value.products.find(item => item.id === product.id);
    if (value.products.some(item => item.id !== product.id && item.slug === product.slug)) return "Cette adresse de fiche appartient déjà à un autre parfum.";
    if (existing && existing.slug !== product.slug) return "L’adresse d’un produit existant doit être conservée.";
    if (value.products.some(item => item.id !== product.id && item.variants.some(variant => product.variants.some(option => option.id === variant.id)))) return "Un format utilise déjà cette référence dans un autre produit.";
    if (existing?.variants.some(variant => {
      const next = product.variants.find(option => option.id === variant.id);
      return (!next || next.kind !== variant.kind || variantVolumeMl(next) !== variantVolumeMl(variant)) && value.orders.some(order => order.inventoryManaged && order.status !== "CANCELLED" && order.items.some(line => line.variantId === variant.id));
    })) return "Un format modifié est utilisé par une commande active. Conservez son type et son volume, ou annulez d’abord la commande. Son prix et son stock restent modifiables.";
    return commit({ ...value, products: existing ? value.products.map(item => item.id === product.id ? product : item) : [product, ...value.products] });
  }
  function setArchived(id: string, archived: boolean) {
    const value = current.current;
    if (!value.products.some(product => product.id === id)) return "Produit introuvable.";
    return commit({ ...value, products: value.products.map(product => product.id === id ? { ...product, archived } : product) });
  }
  function placeOrder(input: OrderInput): { reference: string } | { error: string } {
    const value = current.current;
    if (!value.cart.length) return { error: "Votre panier est vide." };
    if (input.name.trim().length < 2 || !/^(\+212|0)[5-7]\d{8}$/.test(input.phone) || !input.city.trim() || !input.address.trim() || !["Livraison à domicile", "Retrait en boutique"].includes(input.delivery)) return { error: "Vérifiez vos coordonnées et le mode de réception." };
    const items: OrderLine[] = [];
    for (const line of value.cart) {
      const found = lookup(value.products, line.variantId);
      if (!found || found.product.archived || !validLine(line) || line.quantity > found.variant.stock) return { error: "La disponibilité a changé. Revenez au panier pour ajuster votre sélection." };
      items.push({ ...line, productName: found.product.name, brand: found.product.brand, variantLabel: found.variant.label, kind: found.variant.kind, unitPrice: found.variant.price, image: found.product.image });
    }
    const reference = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const order: DemoOrder = { ...input, reference, items, total: Math.round(items.reduce((sum, line) => sum + line.unitPrice! * line.quantity, 0) * 100) / 100, status: "PENDING", createdAt: new Date().toISOString(), inventoryManaged: true };
    const products = value.products.map(product => ({ ...product, variants: product.variants.map(variant => ({ ...variant, stock: variant.stock - (items.find(line => line.variantId === variant.id)?.quantity || 0) })) }));
    const error = commit({ products, cart: [], orders: [order, ...value.orders] });
    return error ? { error } : { reference };
  }
  function setStatus(reference: string, status: string) {
    const value = current.current, order = value.orders.find(item => item.reference === reference);
    if (!order || !statuses.includes(status)) return "Commande ou statut invalide.";
    if (order.status === status) return null;
    const restore = order.inventoryManaged && order.status !== "CANCELLED" && status === "CANCELLED";
    const reserve = order.inventoryManaged && order.status === "CANCELLED" && status !== "CANCELLED";
    if (reserve && order.items.some(line => { const found = lookup(value.products, line.variantId); return !found || found.product.archived || found.variant.stock < line.quantity; })) return "Stock insuffisant ou produit archivé : cette commande ne peut pas être réactivée.";
    const products = restore || reserve ? value.products.map(product => ({ ...product, variants: product.variants.map(variant => ({ ...variant, stock: variant.stock + (restore ? 1 : -1) * order.items.filter(line => line.variantId === variant.id).reduce((sum, line) => sum + line.quantity, 0) })) })) : value.products;
    return commit({ ...value, products, orders: value.orders.map(item => item.reference === reference ? { ...item, status } : item) });
  }
  return <Context.Provider value={{ ...state, ready, storageError, findVariant: id => lookup(state.products, id), add, setQty, remove: id => !commit({ ...current.current, cart: current.current.cart.filter(line => line.variantId !== id) }), clear: () => !commit({ ...current.current, cart: [] }), saveProduct, setArchived, placeOrder, setStatus }}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error("StoreProvider missing"); return value; }
