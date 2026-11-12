"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Droplets, Minus, Plus, ShoppingBag, Sparkles, Store, Truck } from "lucide-react";
import { type Product, money, variantVolumeMl } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import styles from "./product-detail.module.css";

export function ProductDetail({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants.find(v => v.stock > 0)?.id || product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, cart, ready, products } = useStore();
  const reducedMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
  const inCart = cart.find(line => line.variantId === variant.id)?.quantity || 0;
  const available = Math.max(0, variant.stock - inCart);
  const selectedQuantity = Math.min(quantity, available);
  const canAdd = ready && selectedQuantity > 0;
  const isDecant = variant.kind === "decant";
  const related = products.filter(p => !p.archived && p.id !== product.id && p.category === product.category).slice(0, 3);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function selectVariant(id: string) {
    setVariantId(id); setQuantity(1); setAdded(false);
    if (timer.current) clearTimeout(timer.current);
  }
  function addToCart() {
    if (!canAdd) return;
    if (!add(variant.id, selectedQuantity)) return; setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 4500);
  }
  const actionLabel = added ? "Ajouté au panier" : !ready ? "Chargement…" : available === 0 ? (variant.stock ? "Tout est dans votre panier" : "Format épuisé") : "Ajouter au panier";
  const reveal = { initial: reducedMotion ? false as const : { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .12 }, transition: { duration: .55 } };

  return <div className={`nocturne-home ${styles.page}`} style={{ "--fragrance-accent": product.accent } as CSSProperties}>
    <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
      <Link href="/produits"><ArrowLeft size={14} /> La collection</Link><ChevronRight size={11} />
      <Link href={`/produits?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><ChevronRight size={11} />
      <span aria-current="page">{product.name}</span>
    </nav>
    <section className={styles.hero} aria-labelledby="product-title">
      <motion.div className={styles.gallery} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}>
        <div className={styles.galleryTop}><span>LA SÉLECTION LA7YA</span><span>{product.badge || product.category}</span></div>
        <div className={styles.orbit} aria-hidden="true" /><span className={styles.galleryWord} aria-hidden="true">{product.brand}</span>
        <div className={styles.imageStage}><Image src={product.image} alt={`Flacon de ${product.name} par ${product.brand}`} fill priority sizes="(max-width: 850px) 92vw, 49vw" className={styles.bottle} /></div>
        <div className={styles.galleryBottom}><span><i /> {product.brand}</span><span>LE SILLAGE FAIT LA SIGNATURE</span></div>
        <small className={styles.imageCaption}>Visuel du flacon original · le contenant du décant n’est pas représenté</small>
      </motion.div>
      <motion.div className={styles.copy} initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .1 }}>
        <div className={styles.brandLine}><span>{product.brand}</span><span className={styles.collectionLabel}>LA COLLECTION</span></div>
        <h1 id="product-title">{product.name}</h1>
        <p className={styles.intro}>{product.description}</p>
        <div className={styles.noteChips} aria-label="Notes olfactives">{product.notes.map(note => <span key={note}>{note}</span>)}</div>
        <div className={styles.priceRow}><div><strong>{money(variant.price)}</strong><span>{isDecant ? "Décant" : "Flacon original"} · {variant.label}</span></div><span className={variant.stock ? styles.stock : styles.soldOut}><i />{variant.stock ? "Disponible" : "Épuisé"}</span></div>
        <fieldset className={styles.formats}><legend><span>01</span> Trouvez votre format</legend><div className={styles.formatGrid}>{product.variants.map(option => <button type="button" key={option.id} className={`${styles.format} ${option.id === variant.id ? styles.selected : ""}`} disabled={!option.stock} aria-pressed={option.id === variant.id} onClick={() => selectVariant(option.id)}>
          <span className={styles.formatKind}>{option.kind === "bottle" ? "Flacon original" : "Décant"}{option.id === variant.id && <Check size={12} />}</span>
          <b>{variantVolumeMl(option) ?? option.label}{variantVolumeMl(option) !== null && <small> ml</small>}</b><span className={styles.formatPrice}>{option.stock ? money(option.price) : "Épuisé"}</span>
        </button>)}</div></fieldset>
        <div className={styles.formatAdvice}><Droplets size={17} /><p>{isDecant ? "La liberté de découvrir. Votre parfum en petit format, pour l’essayer ou l’emporter partout." : "Votre signature au quotidien. Retrouvez votre fragrance dans son flacon original."}</p></div>
        <div className={styles.purchase}><div className={styles.quantity} role="group" aria-label="Quantité à ajouter">
          <button type="button" aria-label="Réduire la quantité" disabled={!canAdd || selectedQuantity <= 1} onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}><Minus size={15} /></button>
          <span aria-live="polite">{ready ? selectedQuantity : 1}</span>
          <button type="button" aria-label="Augmenter la quantité" disabled={!canAdd || selectedQuantity >= available} onClick={() => setQuantity(Math.min(available, selectedQuantity + 1))}><Plus size={15} /></button>
        </div><button type="button" className={styles.addButton} onClick={addToCart} disabled={!canAdd}>{added ? <Check size={18} /> : <ShoppingBag size={18} />}<span>{actionLabel}</span>{canAdd && <b>{money(variant.price * selectedQuantity)}</b>}</button></div>
        <div className={styles.feedback} role="status" aria-live="polite">{added ? <span><Check size={13} /> Votre sélection vous attend. <Link href="/panier">Voir mon panier <ArrowRight size={13} /></Link></span> : ready && available === 0 && inCart > 0 ? <span>Ce format est déjà dans votre sélection. <Link href="/panier">Voir mon panier <ArrowRight size={13} /></Link></span> : <span>Flacon ou décant : choisissez le format qui vous ressemble.</span>}</div>
        <div className={styles.services}><div><Truck size={18} /><span>Livraison à domicile<small>Frais à confirmer</small></span></div><div><Store size={18} /><span>Retrait à Rabat<small>Galerie La Jeunesse</small></span></div></div>
        <p className={styles.demoNote}>Sélection de démonstration · prix et disponibilités à confirmer. Aucune commande réelle.</p>
      </motion.div>
    </section>
    <motion.section {...reveal} className={styles.scent} aria-labelledby="scent-title"><div className={styles.scentIntro}><span className="nocturne-kicker">L’EMPREINTE OLFACTIVE</span><h2 id="scent-title">Une rencontre.<br /><i>Votre signature.</i></h2><p>Trois notes pour entrer dans l’univers de {product.name}. Le reste se découvre sur votre peau.</p></div><div className={styles.scentNotes}>{product.notes.map((note, index) => <div className={styles.scentNote} key={note}><span>0{index + 1} <Sparkles size={15} /></span><h3>{note}</h3><div aria-hidden="true" /></div>)}</div></motion.section>
    <motion.section {...reveal} className={styles.guide} aria-labelledby="guide-title"><div><span className="nocturne-kicker">LE FORMAT, C’EST AUSSI UNE LIBERTÉ</span><h2 id="guide-title">Un premier rendez-vous<br />ou <i>une évidence.</i></h2><p>Découvrez avant de vous décider, ou retrouvez le parfum qui vous accompagne déjà.</p><a href="#format-help">Comprendre les formats <ArrowRight size={15} /></a></div><div className={styles.guideCards}><article><Droplets size={23} /><span>POUR EXPLORER</span><h3>Le décant.</h3><p>5, 10 ou 20 ml pour découvrir une fragrance à votre rythme et voyager léger.</p></article><article><ShoppingBag size={23} /><span>POUR L’ADOPTER</span><h3>Le flacon.</h3><p>Le format original pour faire de votre parfum un rituel, jour après jour.</p></article></div></motion.section>
    <section className={styles.questions} id="format-help" aria-labelledby="questions-title"><div><span className="nocturne-kicker">AVANT DE CHOISIR</span><h2 id="questions-title">Tout simplement.</h2></div><div className={styles.accordions}>
      <details><summary>Qu’est-ce qu’un décant ? <ChevronDown size={16} /></summary><p>Un décant est une petite quantité de parfum transvasée dans un atomiseur. Il permet de découvrir la fragrance sans choisir immédiatement le grand flacon. Le visuel principal représente le flacon original, pas le contenant du décant.</p></details>
      <details><summary>Quel format choisir ? <ChevronDown size={16} /></summary><p>5 ml pour une première découverte, 10 ml pour prolonger l’expérience ou 20 ml pour l’emporter régulièrement. Si vous connaissez déjà votre parfum, choisissez le flacon original. Le prix affiché correspond au format sélectionné.</p></details>
      <details><summary>Comment recevoir ma sélection ? <ChevronDown size={16} /></summary><p>Le parcours propose la livraison à domicile ou le retrait à la Galerie La Jeunesse, avenue Hassan II à Rabat. Les frais sont à confirmer. Ce site est une démonstration : aucune commande ni livraison réelle n’est déclenchée.</p></details>
    </div></section>
    {related.length > 0 && <motion.section {...reveal} className={styles.related} aria-labelledby="related-title"><header><div><span className="nocturne-kicker">POURSUIVRE LA DÉCOUVERTE</span><h2 id="related-title">D’autres belles <i>rencontres.</i></h2></div><Link href={`/produits?category=${encodeURIComponent(product.category)}`}>Explorer cet univers <ArrowRight size={16} /></Link></header><div className={styles.relatedGrid}>{related.map(p => <ProductCard key={p.id} p={p} />)}</div></motion.section>}
    {ready && <div className={styles.mobileBar}><div><span>{isDecant ? "Décant" : "Flacon"} · {variant.label}</span><strong>{money(variant.price * Math.max(1, selectedQuantity))}</strong></div>{added || available === 0 && inCart > 0 ? <Link href="/panier" className={styles.mobileAction}>Voir mon panier <ArrowRight size={17} /></Link> : <button type="button" className={styles.mobileAction} disabled={!canAdd} onClick={addToCart}><ShoppingBag size={17} />{available ? `Ajouter${selectedQuantity > 1 ? ` × ${selectedQuantity}` : ""}` : "Épuisé"}</button>}</div>}
  </div>;
}
