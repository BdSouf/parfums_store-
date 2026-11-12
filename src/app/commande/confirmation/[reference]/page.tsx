"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CircleHelp, ShoppingBag, Store, Truck } from "lucide-react";
import { money } from "@/lib/data";
import { useStore } from "@/lib/store";
import styles from "./confirmation.module.css";

const statuses: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function Confirmation() {
  const { reference } = useParams<{ reference: string }>();
  const { orders, ready, findVariant } = useStore();
  const reduce = useReducedMotion();
  const order = orders.find(item => item.reference === reference);
  const firstName = order?.name.trim().split(/\s+/)[0];
  const isPickup = order?.delivery === "Retrait en boutique";
  const createdAt = order ? new Date(order.createdAt) : null;
  const date = createdAt && !Number.isNaN(createdAt.getTime())
    ? new Intl.DateTimeFormat("fr-MA", { dateStyle: "long", timeZone: "Africa/Casablanca" }).format(createdAt)
    : null;
  const count = order?.items.reduce((sum, line) => sum + line.quantity, 0) || 0;
  const enter = { initial: reduce ? false as const : { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: .5 } };

  return <div className={`nocturne-home ${styles.page}`}><div className={styles.container}>
    {!ready ? <section className={styles.loading} role="status"><ShoppingBag size={28} strokeWidth={1.4} /><p>Nous retrouvons votre récapitulatif…</p></section> : !order ? <section className={styles.unavailable} aria-labelledby="unavailable-title"><div className={styles.helpIcon}><CircleHelp size={29} strokeWidth={1.3} /></div><span className="nocturne-kicker">VOTRE RÉCAPITULATIF</span><h1 id="unavailable-title">Cette confirmation<br />n’est pas <i>disponible.</i></h1><p>La référence n’a pas été retrouvée dans ce navigateur. Les commandes de démonstration restent sur l’appareil et dans le navigateur utilisés pour les créer.</p><p className={styles.unavailableHint}>Si vous venez de valider votre sélection, vérifiez la référence ou retrouvez le navigateur d’origine.</p><Link href="/produits" className={styles.primary}>Retour à la boutique <ArrowRight size={18} /></Link></section> : <>
      <motion.header {...enter} className={styles.heading}>
        <ol className={styles.steps} aria-label="Étapes de commande"><li><span><Check size={11} /></span> Panier</li><li><span><Check size={11} /></span> Coordonnées</li><li aria-current="step"><span><Check size={11} /></span> Confirmation</li></ol>
        <div className={styles.successIcon}><Check size={32} strokeWidth={1.4} /></div>
        <span className="nocturne-kicker">VOTRE SÉLECTION EST ENREGISTRÉE</span>
        <h1>Merci{firstName ? <>, <i>{firstName}.</i></> : <> <i>à vous.</i></>}</h1>
        <p>Chaque sillage commence par une rencontre.<br /><span>Retrouvez tous les détails de votre commande démo ci-dessous.</span></p>
      </motion.header>
      <motion.div {...enter} className={styles.layout}>
        <section className={styles.receipt} aria-labelledby="receipt-title">
          <div className={styles.receiptHeader}><div><span className={styles.kicker}>VOTRE RÉFÉRENCE</span><p className={styles.reference}>{order.reference}</p></div><span className={`${styles.status} ${order.status === "CANCELLED" ? styles.cancelled : ""}`}><i />{statuses[order.status] || "Statut indisponible"}<small>Démo</small></span></div>
          <div className={styles.receiptHeading}><h2 id="receipt-title">Les pièces choisies.</h2><span>{count} article{count > 1 ? "s" : ""}</span></div>
          <ul className={styles.items}>{order.items.map((line, index) => {
            const found = findVariant(line.variantId);
            return <li key={`${line.variantId}-${index}`}><div className={styles.thumbnail}>{line.image || found ? <Image src={line.image || found!.product.image} alt="" fill sizes="64px" /> : <ShoppingBag size={22} strokeWidth={1.2} />}</div><div className={styles.product}><small>{line.brand || found?.product.brand || "LA7YA STORE"}</small><h3>{line.productName || found?.product.name || "Article du catalogue indisponible"}</h3><p>{line.variantLabel ? `${line.kind === "decant" ? "Décant" : "Flacon original"} · ${line.variantLabel}` : found ? `${found.variant.kind === "decant" ? "Décant" : "Flacon original"} · ${found.variant.label}` : "Référence conservée dans votre commande"}</p></div><span className={styles.quantity}>× {line.quantity}</span></li>;
          })}</ul>
          <div className={styles.total}><div><span>Total provisoire enregistré</span><small>{isPickup ? "Retrait en boutique" : "Hors frais de livraison éventuels"}</small></div><strong>{money(order.total)}</strong></div>
          <div className={styles.receiptFoot}><span>LA7YA STORE · RABAT</span>{date && <time dateTime={order.createdAt}>{date}</time>}</div>
        </section>
        <div className={styles.sideColumn}>
          <section className={styles.details} aria-labelledby="reception-title"><span className={styles.kicker}>LE MODE DE RÉCEPTION CHOISI</span><div className={styles.detailTitle}>{isPickup ? <Store size={23} strokeWidth={1.4} /> : <Truck size={23} strokeWidth={1.4} />}<h2 id="reception-title">{isPickup ? "En boutique." : "À votre adresse."}</h2></div>{isPickup ? <div className={styles.address}><b>Galerie La Jeunesse</b><p>Avenue Hassan II<br />Rabat</p></div> : <div className={styles.address}><b>{order.city}</b><p>{order.address}</p><small>Frais de livraison à confirmer.</small></div>}<div className={styles.contact}><span className={styles.kicker}>VOS COORDONNÉES</span><p>{order.name}<span>{order.phone}</span></p></div></section>
          <div className={styles.demoNote}><span>UNE DÉMONSTRATION, EN TOUTE CLARTÉ</span><p>Cette commande reste dans votre navigateur. Aucun paiement, envoi ou retrait réel n’est déclenché.</p></div>
          <Link href="/produits" className={styles.primary}>Retour à la boutique <ArrowRight size={18} /></Link>
        </div>
      </motion.div>
    </>}
  </div></div>;
}
