"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Plus, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";
import { money } from "@/lib/data";
import { useStore, type CartLine } from "@/lib/store";
import styles from "./cart.module.css";

export default function Cart() {
  const { cart, setQty, remove, add, ready, findVariant } = useStore();
  const [removed, setRemoved] = useState<CartLine | null>(null);
  const reducedMotion = useReducedMotion();
  const lines = cart.flatMap(line => {
    const match = findVariant(line.variantId);
    return match ? [{ ...line, ...match }] : [];
  });
  const missingLines = cart.filter(line => !findVariant(line.variantId));
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const needsAdjustment = missingLines.length > 0 || lines.some(line => !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > line.variant.stock || line.product.archived);
  const removedProduct = removed ? findVariant(removed.variantId) : undefined;

  function removeLine(line: CartLine) {
    setRemoved({ variantId: line.variantId, quantity: line.quantity });
    if (!remove(line.variantId)) setRemoved(null);
  }

  function undoRemove() {
    if (!removed || !removedProduct) return;
    const current = cart.find(line => line.variantId === removed.variantId);
    const restored = Math.min(removedProduct.product.archived ? 0 : removedProduct.variant.stock, (current?.quantity || 0) + removed.quantity);
    if (restored > 0) {
      const saved = current ? setQty(removed.variantId, restored) : add(removed.variantId, restored);
      if (saved) setRemoved(null);
    }
  }

  return <div className={`nocturne-home ${styles.page}`}>
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Fil d’Ariane"><Link href="/produits"><ArrowLeft size={14} /> La collection</Link><ChevronRight size={12} /><span aria-current="page">Mon panier</span></nav>
      <header className={styles.heading}>
        <div><span className="nocturne-kicker">LE DÉBUT D’UNE SIGNATURE</span><h1>Mon panier<span>.</span></h1><p>{!ready ? "Un instant, nous retrouvons votre sélection." : lines.length ? "Vérifiez votre sélection, puis passez à la commande." : "Une belle rencontre commence parfois par un parfum."}</p></div>
        <ol className={styles.steps} aria-label="Étapes de commande"><li aria-current="step"><span>01</span> Panier</li><li><span>02</span> Coordonnées</li><li><span>03</span> Confirmation</li></ol>
      </header>

      {removedProduct && removed && <div className={styles.undoNotice}><p role="status"><Check size={15} /> {removedProduct.product.name} a été retiré.</p><button type="button" onClick={undoRemove} disabled={!removedProduct.variant.stock || removedProduct.product.archived}><RotateCcw size={14} /> Annuler</button></div>}

      {!ready ? <div className={styles.loading} role="status"><ShoppingBag size={25} /><p>Préparation de votre sélection…</p><div /><div /></div> : !lines.length && !missingLines.length ? <>
        <motion.section className={styles.empty} initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} aria-labelledby="empty-title">
          <div className={styles.emptyCopy}><div className={styles.bagIcon}><ShoppingBag size={30} strokeWidth={1.2} /></div><span className="nocturne-kicker">TOUT RESTE À DÉCOUVRIR</span><h2 id="empty-title">Votre prochain coup<br />de cœur <i>vous attend.</i></h2><p>Un flacon qui devient votre signature. Un décant pour faire connaissance. Commencez par ce qui vous inspire.</p><Link href="/produits" className={styles.primary}>Explorer la collection <ArrowRight size={18} /></Link></div>
          <div className={styles.emptyArt}><span>LA COLLECTION LA7YA</span><Image src="/images/full-bottles-studio-demo.png" alt="Composition de démonstration de trois flacons de parfum" fill priority sizes="(max-width: 750px) 90vw, 45vw" /><small>DES SILLAGES À RENCONTRER.</small></div>
        </motion.section>
      </> : <>
        <div className={styles.layout}>
          <section className={styles.selection} aria-labelledby="selection-title">
            <div className={styles.listHeading}><h2 id="selection-title">Les pièces choisies <span>{String(itemCount).padStart(2, "0")}</span></h2><span>{lines.length} référence{lines.length > 1 ? "s" : ""}</span></div>
            <div className={styles.lines}>{missingLines.map(line => <article className={styles.stockWarning} key={line.variantId}><span>Un format de votre panier a été retiré du catalogue.</span><button type="button" onClick={() => remove(line.variantId)}>Retirer ce format</button></article>)}{lines.map(line => {
              const invalid = line.quantity < 1 || !Number.isInteger(line.quantity) || line.quantity > line.variant.stock;
              return <motion.article layout={!reducedMotion} key={line.variantId} className={styles.line} transition={{ duration: .2 }}>
                <div className={styles.thumbnail} style={{ "--item-accent": line.product.accent } as CSSProperties} ><Image src={line.product.image} alt={`Flacon de ${line.product.name}`} fill sizes="(max-width: 600px) 88px, 120px" /></div>
                <div className={styles.productInfo}><span className={styles.brand}>{line.product.brand}</span><h3>{line.product.name}</h3><div className={styles.variant}><span>{line.variant.kind === "decant" ? "Décant" : "Flacon original"}</span><span>{line.variant.label}</span></div><span className={styles.unitPrice}>{money(line.variant.price)} / unité</span></div>
                <div className={styles.lineActions}><strong>{money(line.variant.price * line.quantity)}</strong><div className={styles.quantity} role="group" aria-label={`Quantité de ${line.product.name}, ${line.variant.label}`}><button type="button" disabled={line.product.archived || line.quantity <= 1} aria-label={`Réduire la quantité de ${line.product.name}, ${line.variant.label}`} onClick={() => setQty(line.variantId, line.quantity - 1)}><Minus size={14} /></button><span aria-live="polite">{line.quantity}</span><button type="button" disabled={line.product.archived || line.quantity >= line.variant.stock} aria-label={`Augmenter la quantité de ${line.product.name}, ${line.variant.label}`} onClick={() => setQty(line.variantId, Math.min(line.variant.stock, line.quantity + 1))}><Plus size={14} /></button></div><button type="button" className={styles.remove} aria-label={`Retirer ${line.product.name}, ${line.variant.label} du panier`} onClick={() => removeLine(line)}><Trash2 size={13} /> Retirer</button></div>
                {invalid && <div className={styles.stockWarning}><span>{line.product.archived ? "Ce produit n’est plus en vente. Retirez-le pour continuer." : line.variant.stock ? `Ce format est limité à ${line.variant.stock} unité${line.variant.stock > 1 ? "s" : ""}.` : "Ce format est actuellement épuisé."}</span>{line.variant.stock > 0 && !line.product.archived ? <button type="button" onClick={() => setQty(line.variantId, Math.max(1, Math.min(line.variant.stock, Math.floor(line.quantity) || 1)))}>Ajuster la quantité</button> : <button type="button" onClick={() => removeLine(line)}>Retirer ce format</button>}</div>}
              </motion.article>;
            })}</div>
          </section>
          <aside className={styles.summary} aria-labelledby="summary-title"><span className="nocturne-kicker">VOTRE COMMANDE</span><h2 id="summary-title">En résumé.</h2><dl className={styles.breakdown}><div><dt>Sous-total <span>({itemCount} article{itemCount > 1 ? "s" : ""})</span></dt><dd>{money(total)}</dd></div><div><dt>Livraison</dt><dd className={styles.pending}>À confirmer</dd></div></dl><div className={styles.total}><span>Total provisoire<small>Hors frais de livraison éventuels</small></span><output aria-label="Total provisoire" aria-live="polite" aria-atomic="true">{money(total)}</output></div>{needsAdjustment ? <p className={styles.checkoutWarning} role="alert">Ajustez les quantités signalées pour continuer.</p> : <Link href="/commande" className={styles.primary}>Passer à la commande <ArrowRight size={18} /></Link>}<p className={styles.nextStep}>À l’étape suivante : vos coordonnées et le mode de réception.</p><p className={styles.demo}><span>DÉMONSTRATION</span>Aucun paiement ni commande réelle. Votre sélection est conservée dans ce navigateur.</p></aside>
        </div>
      </>}
    </div>
  </div>;
}


