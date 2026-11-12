"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { decantFormats, isDecantVariant } from "@/lib/data";

import { useStore } from "@/lib/store";

const universes = [
  { title: "Grandes marques", label: "Dior · Chanel · YSL", image: "/products/catalog/armani-stronger-cutout.png", href: "/produits?category=Grandes%20marques" },
  { title: "Parfums de niche", label: "Signatures rares", image: "/products/catalog/pdm-layton-cutout.png", href: "/produits?category=Parfums%20de%20niche" },
  { title: "Parfums arabes", label: "Tendances du moment", image: "/products/catalog/lattafa-khamrah-cutout.png", href: "/produits?category=Parfums%20arabes" },
];

export default function Home() {
  const reduce = useReducedMotion();
  const { products: allProducts } = useStore();
  const products = allProducts.filter(product => !product.archived);
  const [decantFormat, setDecantFormat] = useState<number>(10);
  const decantCount = products.filter((product) => product.variants.some((variant) => isDecantVariant(variant, decantFormat) && variant.stock > 0)).length;
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
        <Image src="/images/full-bottles-studio-demo.png" alt="Composition de démonstration de trois flacons de parfum sans marque" fill sizes="(max-width: 800px) 100vw, 55vw" />
        <span>VISUEL DE DÉMONSTRATION</span>
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

    <section className="nocturne-story">
      <Image src="/products/catalog/amouage-interlude-cutout.png" alt="Interlude Man d’Amouage" fill sizes="(max-width: 700px) 100vw, 52vw" />
      <div className="nocturne-story-shade" />
      <div><span className="nocturne-kicker">LE RITUEL LA7YA</span><h2>Choisir une présence,<br />pas seulement un parfum.</h2><p>Découvrez les formats disponibles, comparez les univers et préparez votre commande en quelques gestes.</p><Link href="/produits" className="nocturne-cta">Commencer <ArrowRight /></Link></div>
    </section>
  </main>;
}
