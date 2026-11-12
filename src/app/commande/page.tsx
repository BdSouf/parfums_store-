"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ShoppingBag, Store, Truck } from "lucide-react";
import { money } from "@/lib/data";
import { useStore } from "@/lib/store";
import styles from "./checkout.module.css";

type Reception = "delivery" | "pickup";

export default function Checkout() {
  const router = useRouter();
  const { cart, placeOrder, findVariant, ready } = useStore();
  const [reception, setReception] = useState<Reception>("delivery");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false);
  const phoneInput = useRef<HTMLInputElement>(null);
  const errorNotice = useRef<HTMLParagraphElement>(null);
  const lines = cart.flatMap(line => {
    const match = findVariant(line.variantId);
    return match ? [{ ...line, ...match }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const invalidCart = lines.length !== cart.length || lines.some(line => !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > line.variant.stock || line.product.archived);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitted.current) return;
    setError(""); setPhoneError("");
    if (!lines.length || invalidCart) {
      setError("Votre sélection a changé. Revenez au panier pour vérifier les quantités.");
      requestAnimationFrame(() => errorNotice.current?.focus());
      return;
    }
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/[\s().-]/g, "").replace(/^00212/, "+212");
    const city = reception === "pickup" ? "Rabat" : String(form.get("city") || "").trim();
    const address = reception === "pickup" ? "Retrait en boutique — Galerie La Jeunesse, avenue Hassan II, Rabat" : String(form.get("address") || "").trim();
    if (!/^(\+212|0)[5-7]\d{8}$/.test(phone)) {
      setPhoneError("Saisissez un numéro marocain valide, par exemple 06 12 34 56 78.");
      phoneInput.current?.focus();
      return;
    }
    if (name.length < 2 || (reception === "delivery" && (city.length < 2 || address.length < 5))) {
      setError("Vérifiez votre nom et les informations de livraison.");
      requestAnimationFrame(() => errorNotice.current?.focus());
      return;
    }
    submitted.current = true;
    setBusy(true);
    const result = placeOrder({ name, phone, city, address, delivery: reception === "delivery" ? "Livraison à domicile" : "Retrait en boutique" });
    if ("error" in result) { submitted.current = false; setBusy(false); setError(result.error); requestAnimationFrame(() => errorNotice.current?.focus()); return; }
    router.push(`/commande/confirmation/${result.reference}`);
  }

  return <div className={`nocturne-home ${styles.page}`}><div className={styles.container}>
    <Link href="/panier" className={styles.back}><ArrowLeft size={14} /> Retour au panier</Link>
    <header className={styles.heading}><div><span className="nocturne-kicker">VOTRE PARCOURS LA7YA</span><h1>Presque à <i>vous.</i></h1><p>Vos coordonnées, votre mode de réception. Et c’est tout.</p></div><ol className={styles.steps} aria-label="Étapes de commande"><li><span><Check size={12} /></span> Panier</li><li aria-current="step"><span>02</span> Coordonnées</li><li><span>03</span> Confirmation</li></ol></header>
    {!ready ? <div className={styles.loading} role="status"><ShoppingBag size={25} /><p>Préparation de votre commande…</p></div> : !lines.length && !busy ? <section className={styles.empty}><ShoppingBag size={30} strokeWidth={1.3} /><h2>Votre panier vous attend.</h2><p>Ajoutez un parfum avant de compléter vos coordonnées.</p><Link href="/produits" className={styles.primary}>Découvrir la collection <ArrowRight size={17} /></Link></section> : <form onSubmit={submit} className={styles.layout} aria-label="Coordonnées et réception de votre commande" aria-busy={busy}>
      <div className={styles.formColumn}>
        <fieldset className={styles.section} disabled={busy}><legend><span>01</span> Vos coordonnées</legend><p className={styles.sectionHint}>Les champs ci-dessous sont obligatoires.</p><div className={styles.fields}>
          <label>Nom complet<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Votre prénom et votre nom" /></label>
          <label>Téléphone<input ref={phoneInput} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} placeholder="06 12 34 56 78" aria-invalid={phoneError ? true : undefined} aria-describedby={phoneError ? "phone-error" : "phone-hint"} onChange={() => { if (phoneError) setPhoneError(""); }} />{phoneError ? <span className={styles.fieldError} id="phone-error" role="alert">{phoneError}</span> : <small id="phone-hint">Numéro marocain, avec 0 ou +212.</small>}</label>
        </div></fieldset>
        <fieldset className={styles.section} disabled={busy}><legend><span>02</span> Comment recevoir votre sélection ?</legend><div className={styles.options}>
          <label className={`${styles.option} ${reception === "delivery" ? styles.selected : ""}`}><input type="radio" name="reception" value="delivery" checked={reception === "delivery"} onChange={() => { setReception("delivery"); setError(""); }} /><Truck size={22} strokeWidth={1.5} /><span><b>Livraison à domicile</b><small>À l’adresse de votre choix</small><em>Frais à confirmer</em></span></label>
          <label className={`${styles.option} ${reception === "pickup" ? styles.selected : ""}`}><input type="radio" name="reception" value="pickup" checked={reception === "pickup"} onChange={() => { setReception("pickup"); setError(""); }} /><Store size={22} strokeWidth={1.5} /><span><b>Retrait en boutique</b><small>Galerie La Jeunesse, Rabat</small><em>Vous passez en boutique</em></span></label>
        </div>
        <div className={styles.addressFields} hidden={reception !== "delivery"}><div className={styles.fields}><label className={styles.fullWidth}>Ville<input name="city" autoComplete="address-level2" required={reception === "delivery"} disabled={reception !== "delivery" || busy} minLength={2} maxLength={100} placeholder="Ex. Rabat" /></label><label className={styles.fullWidth}>Adresse complète<textarea name="address" autoComplete="street-address" required={reception === "delivery"} disabled={reception !== "delivery" || busy} minLength={5} maxLength={500} rows={3} placeholder="Quartier, rue, numéro et appartement" /></label></div></div>
        {reception === "pickup" && <div className={styles.pickup}><span>VOTRE POINT DE RETRAIT</span><p>Galerie La Jeunesse<br /><small>Avenue Hassan II, Rabat</small></p><small>Cette démonstration ne déclenche aucune préparation en boutique.</small></div>}
        </fieldset>
      </div>
      <aside className={styles.summary} aria-labelledby="checkout-summary"><span className="nocturne-kicker">VOTRE SÉLECTION</span><h2 id="checkout-summary">Tout est ici.</h2><ul className={styles.items}>{lines.map(line => <li key={line.variantId}><div className={styles.thumb}><Image src={line.product.image} alt="" fill sizes="56px" /></div><div><small>{line.product.brand}</small><h3>{line.product.name}</h3><span>{line.variant.kind === "decant" ? "Décant" : "Flacon"} · {line.variant.label} × {line.quantity}</span></div><strong>{money(line.variant.price * line.quantity)}</strong></li>)}</ul><dl className={styles.breakdown}><div><dt>Sous-total ({count} article{count > 1 ? "s" : ""})</dt><dd>{money(total)}</dd></div><div><dt>Réception</dt><dd>{reception === "delivery" ? "À domicile" : "En boutique"}</dd></div>{reception === "delivery" && <div><dt>Frais de livraison</dt><dd>À confirmer</dd></div>}</dl><div className={styles.total}><span>Total provisoire<small>{reception === "delivery" ? "Hors frais de livraison éventuels" : "Retrait en boutique"}</small></span><output aria-live="polite" aria-atomic="true">{money(total)}</output></div>
        {invalidCart && <p className={styles.error} role="alert">Les quantités doivent être ajustées. <Link href="/panier">Revenir au panier</Link></p>}{error && <p ref={errorNotice} tabIndex={-1} className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.primary} disabled={busy || invalidCart}>{busy ? "Enregistrement…" : "Valider ma commande démo"}{!busy && <ArrowRight size={18} />}</button><p className={styles.demo}>Aucune commande réelle ni aucun paiement.<br />Vos informations restent dans ce navigateur.</p>
      </aside>
    </form>}
  </div></div>;
}
