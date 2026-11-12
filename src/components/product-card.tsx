"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type Product, money } from "@/lib/data";
import { useStore } from "@/lib/store";

export function ProductCard({ p, variantId }: { p: Product; variantId?: string }) {
  const selected = variantId ? p.variants.find(variant => variant.id === variantId) : undefined;
  const first = selected || [...p.variants].filter(variant => variant.stock > 0).sort((a, b) => a.price - b.price)[0] || p.variants[0];
  const { add, cart, ready } = useStore();
  const stock = first.stock > 0 && !p.archived;
  const available = first.stock - (cart.find(line => line.variantId === first.id)?.quantity || 0);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function quick() {
    if (!add(first.id)) return;
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }
  return <motion.article className="product-card" style={{ "--accent": p.accent } as React.CSSProperties} whileHover={reduce ? undefined : { y: -6 }} transition={{ duration: .2 }}>
    <div className="product-art"><Link href={`/produits/${p.slug}`} className="product-visual"><span className="product-halo" aria-hidden="true" /><Image src={p.image} alt={`Visuel d’illustration pour ${p.name}`} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" className="product-photo" />{p.badge && <em>{p.badge}</em>}</Link><button className={added ? "quick-add added" : "quick-add"} onClick={quick} disabled={!ready || !stock || available <= 0} aria-label={`Ajouter ${p.name}, ${first.kind === "decant" ? "décant" : "flacon"} ${first.label}, ${money(first.price)} au panier`}>{added ? <><Check /> Ajouté</> : <><ShoppingBag /> Ajouter</>}</button></div>
    <div className="product-meta"><div className="product-brand"><small>{p.brand}</small><span className={stock ? "stock" : "stock out"}>{stock ? "En stock" : "Épuisé"}</span></div><Link href={`/produits/${p.slug}`}><h3>{p.name}</h3></Link><p>{first.kind === "decant" ? "Décant" : "Flacon original"} · {first.label}</p><strong>{selected ? money(first.price) : `À partir de ${money(first.price)}`}</strong></div>
  </motion.article>;
}
