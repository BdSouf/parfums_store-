"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Layers3, MoonStar, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { decantFormats, isBottleVariant, isDecantVariant, money, type Product } from "@/lib/data";

import { useStore } from "@/lib/store";

const universes = [
  { title: "Grandes marques", label: "Dior · Chanel · YSL", image: "/products/catalog/armani-stronger-cutout.png", href: "/produits?category=Grandes%20marques" },
  { title: "Parfums de niche", label: "Signatures rares", image: "/products/catalog/pdm-layton-cutout.png", href: "/produits?category=Parfums%20de%20niche" },
  { title: "Parfums arabes", label: "Tendances du moment", image: "/products/catalog/lattafa-khamrah-cutout.png", href: "/produits?category=Parfums%20arabes" },
];

const packDefinitions = [
  {
    id: "discovery",
    label: "Découverte",
    title: "Pack Découverte Décant",
    description: "Trois signatures en format 10 ml pour explorer, comparer et trouver votre prochain parfum.",
    slugs: ["dior-sauvage-edp", "xerjoff-naxos", "lattafa-khamrah"],
    kind: "decant" as const,
    href: "/produits?format=10",
  },
  {
    id: "icons",
    label: "Flacons complets",
    title: "Pack Icônes en flacon",
    description: "Trois maisons incontournables réunies dans une sélection élégante et contrastée.",
    slugs: ["bleu-de-chanel-edp", "xerjoff-naxos", "armani-stronger-with-you-intensely"],
    kind: "bottle" as const,
    href: "/produits?type=bottle",
  },
  {
    id: "arabic",
    label: "Sélection arabe",
    title: "Pack Signature Arabe",
    description: "Une sélection chaleureuse et puissante parmi les signatures arabes du moment.",
    slugs: ["lattafa-khamrah", "afnan-9pm", "armaf-club-de-nuit-intense-man"],
    kind: "bottle" as const,
    href: "/produits?category=Parfums%20arabes",
  },
];

const packIcon = (id: string) => id === "discovery" ? <Sparkles /> : id === "icons" ? <Layers3 /> : <MoonStar />;

function resolvePackProducts(products: Product[], slugs: readonly string[]) {
  return slugs.flatMap((slug) => {
    const product = products.find((item) => item.slug === slug);
    return product ? [product] : [];
  });
}

export default function Home() {
  const reduce = useReducedMotion();
  const { products: allProducts } = useStore();
  const products = allProducts.filter(product => !product.archived);
  const [decantFormat, setDecantFormat] = useState<number>(10);
  const decantCount = products.filter((product) => product.variants.some((variant) => isDecantVariant(variant, decantFormat) && variant.stock > 0)).length;
  const packs = packDefinitions.map((definition) => {
    const items = resolvePackProducts(products, definition.slugs);
    const variants = items.flatMap((product) => {
      const variant = product.variants.find((item) => definition.kind === "decant" ? isDecantVariant(item, 10) : isBottleVariant(item));
      return variant ? [variant] : [];
    });
    return {
      ...definition,
      items,
      price: variants.reduce((total, variant) => total + variant.price, 0),
      ready: items.length === definition.slugs.length && variants.length === definition.slugs.length && variants.every((variant) => variant.stock > 0),
    };
  });
  return <main className="nocturne-home">
    <section className="nocturne-hero">
      <motion.div className="nocturne-hero-image" initial={reduce ? false : { opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [.22, 1, .36, 1] }}>
        <Image src="/products/catalog/xerjoff-naxos.png" alt="Naxos de Xerjoff" fill priority sizes="100vw" />
      </motion.div>
      <div className="nocturne-veil" />
      <button className="hero-arrow hero-arrow-left" aria-label="Visuel précédent"><ChevronLeft /></button>
      <motion.div className="nocturne-copy" initial={reduce ? false : { opacity: 0, x: -34 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2, duration: .75 }}>
        <span className="nocturne-kicker">MAISON LA7YA · RABAT</span>
        <h1>L’élégance<br />laisse une trace.</h1>
        <p>Parfums arabes, signatures de niche et objets choisis pour celles et ceux qui ne passent pas inaperçus.</p>
        <Link className="nocturne-cta" href="/produits">Explorer la collection <ArrowRight /></Link>
      </motion.div>
      <button className="hero-arrow hero-arrow-right" aria-label="Visuel suivant"><ChevronRight /></button>
      <div className="hero-dots"><b /><i /><i /></div>
    </section>

    <section className="universe-overlap" aria-label="Nos univers">
      {universes.map((item, index) => <motion.article key={item.title} initial={reduce ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }}>
        <Link href={item.href}>
          <Image src={item.image} alt="" fill sizes="(max-width: 700px) 86vw, 31vw" />
          <div className="universe-shade" />
          <span><small>{item.label}</small><strong>{item.title}</strong></span>
          <i><ArrowRight /></i>
        </Link>
      </motion.article>)}
    </section>

    <motion.section id="parfums-en-flacon" className="decant-editorial bottle-editorial" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>
      <motion.div className="decant-editorial-copy" initial={reduce ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .6, delay: .08 }}>
        <span className="nocturne-kicker">LA COLLECTION</span>
        <h2>L&apos;art du parfum,<br /><i>sans compromis.</i></h2>
        <p>Découvrez les grandes maisons, les signatures de niche et les créations arabes dans leur format original.</p>
        <Link className="nocturne-cta decant-cta" href="/produits?type=bottle">Explorer les parfums <ArrowRight /></Link>
      </motion.div>
      <motion.div className="decant-editorial-visual bottle-editorial-visual" initial={reduce ? false : { opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .75, delay: .12 }}>
        <Image src="/images/full-bottles-studio-web-v3.png" alt="Creed Aventus, Baccarat Rouge 540 et Tom Ford Oud Wood réunis dans une composition studio" fill sizes="(max-width: 800px) 100vw, 64vw" />
      </motion.div>
    </motion.section>

    <motion.section id="decants" className="decant-editorial" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>
      <div className="decant-editorial-copy">
        <span className="nocturne-kicker">L&apos;ART DU DÉCANT</span>
        <h2>Le luxe,<br /><i>à votre mesure.</i></h2>
        <p>Explorez une signature avant le grand format, ou emportez votre parfum partout. Une façon plus libre de découvrir les sillages d’exception.</p>
        <div className="decant-format-block">
          <span>Choisir un format</span>
          <div className="decant-formats" role="group" aria-label="Choisir le format du décant">
            {decantFormats.map((format) => <button suppressHydrationWarning type="button" className={decantFormat === format ? "active" : ""} aria-pressed={decantFormat === format} onClick={() => setDecantFormat(format)} key={format}>{format}<small>ml</small></button>)}
          </div>
          <motion.p key={decantFormat} initial={reduce ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="decant-availability">{decantCount ? `${decantCount} référence${decantCount > 1 ? "s" : ""} disponible${decantCount > 1 ? "s" : ""}` : "Disponibilité à confirmer par la boutique"}</motion.p>
        </div>
        <Link className="nocturne-cta decant-cta" href={`/produits?category=Décants&format=${decantFormat}`}>Découvrir les décants <ArrowRight /></Link>
      </div>
      <motion.div className="decant-editorial-visual" initial={reduce ? false : { opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .75, delay: .1 }}>
        <Image src="/images/decants-studio-demo.png" alt="Visuel de démonstration de trois atomiseurs de parfum, formats 5, 10 et 20 ml" fill sizes="(max-width: 800px) 100vw, 55vw" />
        <span>VISUEL DE DÉMONSTRATION</span>
        <div className="decant-size-markers" aria-hidden="true"><b className={decantFormat === 5 ? "active" : ""}>5 ml</b><b className={decantFormat === 10 ? "active" : ""}>10 ml</b><b className={decantFormat === 20 ? "active" : ""}>20 ml</b></div>
      </motion.div>
    </motion.section>

    <motion.section id="packs" className="pack-showcase" initial={reduce ? false : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>
      <header className="pack-showcase-heading">
        <div>
          <span className="nocturne-kicker">LA SÉLECTION LA7YA</span>
          <h2>Nos sélections <i>La7ya.</i></h2>
          <p>Des compositions pensées pour découvrir, collectionner ou offrir des parfums d&apos;exception.</p>
        </div>
        <Link href="/produits" className="pack-all-link">Explorer le catalogue <ArrowRight /></Link>
      </header>

      <div className="pack-grid">
        {packs.map((pack, index) => <motion.article className={`pack-card pack-card-${pack.id}`} key={pack.id} initial={reduce ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduce ? 0 : .55, delay: index * .08 }}>
          <div className="pack-card-visual">
            <span className="pack-card-label">{packIcon(pack.id)} {pack.label}</span>
            {pack.id === "discovery" ? <Image className="pack-decant-visual" src="/images/decants-studio-demo.png" alt="Atomiseurs de parfum en formats decant" fill sizes="(max-width: 900px) 80vw, 31vw" /> : <div className="pack-products" aria-label={pack.items.map((item) => `${item.brand} ${item.name}`).join(", ")}>
              {pack.items.map((item) => <span className="pack-product" key={item.id}><Image src={item.image} alt="" fill sizes="(max-width: 900px) 24vw, 10vw" /></span>)}
            </div>}
            <div className="pack-card-glow" />
          </div>
          <div className="pack-card-body">
            <span className="pack-count">{pack.items.length} références {pack.kind === "decant" ? "· 10 ml" : "· flacons complets"}</span>
            <h3>{pack.title}</h3>
            <p>{pack.description}</p>
            <div className="pack-card-bottom">
              <div><small>Valeur de la sélection</small><strong>{pack.ready ? money(pack.price) : "À composer"}</strong></div>
              <Link href={pack.href} aria-label={`Composer ${pack.title}`}>Composer le pack <ArrowRight /></Link>
            </div>
          </div>
        </motion.article>)}
      </div>
      <p className="pack-footnote">Les montants sont calculés depuis les prix et formats actuellement disponibles dans le catalogue. Aucun stock distinct n&apos;est créé pour ces sélections.</p>
    </motion.section>

    <section className="nocturne-story">
      <Image src="/products/catalog/amouage-interlude-cutout.png" alt="Interlude Man d’Amouage" fill sizes="(max-width: 700px) 100vw, 52vw" />
      <div className="nocturne-story-shade" />
      <div><span className="nocturne-kicker">LE RITUEL LA7YA</span><h2>Choisir une présence,<br />pas seulement un parfum.</h2><p>Découvrez les formats disponibles, comparez les univers et préparez votre commande en quelques gestes.</p><Link href="/produits" className="nocturne-cta">Commencer <ArrowRight /></Link></div>
    </section>
  </main>;
}
