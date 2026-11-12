"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ProductDetail } from "./product-detail";
import styles from "./product-detail.module.css";

export function ProductRoute({ slug }: { slug: string }) {
  const { products, ready } = useStore();
  const product = products.find(item => item.slug === slug && !item.archived);
  if (!ready) return <div className={`nocturne-home ${styles.routeState}`} role="status">Chargement du parfum…</div>;
  if (!product) return <div className={`nocturne-home ${styles.routeState}`}><span className="nocturne-kicker">LA COLLECTION LA7YA</span><h1>Ce parfum n’est plus disponible.</h1><p>Il a été archivé ou n’existe pas dans ce navigateur.</p><Link href="/produits" className="nocturne-cta">Retour à la collection</Link></div>;
  return <ProductDetail key={product.id} product={product} />;
}
