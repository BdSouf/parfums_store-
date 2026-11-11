"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useStore } from "@/lib/store";

const Brand=({inverse=false}:{inverse?:boolean})=><span className={inverse?"brand-mark inverse":"brand-mark"}><Image className="brand-logo" src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={180} height={103} priority/></span>;

const links=[
  ["/","Accueil"],
  ["/produits","Tous les parfums"],
  ["/produits?category=Grandes%20marques","Grandes marques"],
  ["/produits?category=Parfums%20de%20niche","Parfums de niche"],
  ["/produits?category=Parfums%20arabes","Parfums arabes"],
  ["/admin","Espace administrateur"],
];

export function Header(){
  const[open,setOpen]=useState(false);
  const[search,setSearch]=useState(false);
  const[scrolled,setScrolled]=useState(false);
  const reduce=useReducedMotion();
  const{cart}=useStore();
  const count=cart.reduce((a,b)=>a+b.quantity,0);
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>28);onScroll();addEventListener("scroll",onScroll,{passive:true});return()=>removeEventListener("scroll",onScroll)},[]);
  return <>
    <div className="demo-bar"><span>Démonstration non officielle</span><b>Livraison & retrait à Rabat · Démo</b></div>
    <header className={scrolled?"header scrolled":"header"}>
      <button onClick={()=>setOpen(true)} className="menu modern" aria-label="Ouvrir le menu"><Menu/></button>
      <nav className="nav"><Link href="/produits?category=Grandes%20marques">Designers</Link><Link href="/produits?category=Parfums%20de%20niche">Niche</Link><Link href="/produits?category=Parfums%20arabes">Arabes</Link></nav>
      <Link href="/" className="header-brand" aria-label="La7ya Store, accueil"><Brand/></Link>
      <div className="actions"><button onClick={()=>setSearch(true)} aria-label="Ouvrir la recherche"><Search size={20}/></button><Link href="/panier" className="bag" aria-label={`Panier, ${count} articles`}><ShoppingBag size={21}/>{count>0&&<motion.b key={count} initial={reduce?false:{scale:.5}} animate={{scale:1}}>{count}</motion.b>}</Link></div>
    </header>
    <AnimatePresence>
      {open&&<motion.div className="mobile-drawer" initial={reduce?false:{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:reduce?0:.35,ease:[.22,1,.36,1]}}><div className="drawer-head"><Brand/><button onClick={()=>setOpen(false)} aria-label="Fermer"><X/></button></div><nav>{links.map(([href,label],i)=><motion.div key={href} initial={reduce?false:{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:reduce?0:.08+i*.04}}><Link href={href} onClick={()=>setOpen(false)}><span>0{i+1}</span>{label}<ArrowRight/></Link></motion.div>)}</nav><p>Démonstration commerciale · Rabat</p></motion.div>}
      {search&&<motion.div className="search-overlay" initial={reduce?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><button className="search-close" onClick={()=>setSearch(false)} aria-label="Fermer"><X/></button><motion.div initial={reduce?false:{y:20,opacity:0}} animate={{y:0,opacity:1}}><span className="eyebrow">RECHERCHE</span><form action="/produits"><input autoFocus name="q" placeholder="Quel parfum recherchez-vous ?"/><button aria-label="Rechercher"><ArrowRight/></button></form><p>Essayez « Dior », « Xerjoff » ou « Lattafa »</p></motion.div></motion.div>}
    </AnimatePresence>
  </>;
}

export function Footer(){return <footer><div><Link href="/" aria-label="Accueil"><Brand inverse/></Link><p>Une expérience de parfumerie contemporaine imaginée pour La7ya Store à Rabat.</p></div><div><h4>Découvrir</h4><Link href="/produits">Tous les produits</Link><Link href="/produits?category=Parfums%20de%20niche">Parfums de niche</Link><Link href="/produits?category=Parfums%20arabes">Parfums arabes</Link></div><div><h4>Informations</h4><p>Galerie La Jeunesse<br/>Avenue Hassan II, Rabat</p><p>Démonstration non officielle. Marques, prix et disponibilité à confirmer avant production.</p></div></footer>}
