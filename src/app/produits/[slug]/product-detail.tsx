"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {Check,Minus,Plus,ShoppingBag} from "lucide-react";
import {Product,money,products} from "@/lib/data";
import {useStore} from "@/lib/store";
import {ProductCard} from "@/components/product-card";

export function ProductDetail({product}:{product:Product}){
  const [variantId,setVariantId]=useState(product.variants.find(v=>v.stock>0)?.id||product.variants[0].id);
  const [qty,setQty]=useState(1); const [added,setAdded]=useState(false); const {add}=useStore();
  const v=product.variants.find(x=>x.id===variantId)!;
  const related=products.filter(p=>p.id!==product.id&&p.category===product.category).slice(0,3);
  const submit=()=>{if(!v.stock)return;add(v.id,qty);setAdded(true);setTimeout(()=>setAdded(false),1800)};
  return <><section className="detail section">
    <div className="detail-gallery"><div className="detail-art" style={{"--accent":product.accent} as React.CSSProperties}><Image src={product.image} alt={`Photo d’illustration pour ${product.name}`} fill priority sizes="(max-width: 900px) 100vw, 50vw" className="detail-photo"/><em>VISUEL SOUS LICENCE · PRODUIT DE DÉMONSTRATION</em></div><div className="thumbnails"><button className="active" aria-label="Afficher la vue principale"><Image src={product.image} alt="" fill sizes="80px"/></button><span>1 / 1</span></div></div>
    <div className="detail-copy"><Link href="/produits" className="back">← Retour au catalogue</Link><span className="eyebrow">{product.brand} · {product.category}</span><h1>{product.name}</h1><div className="detail-price">{money(v.price)} <span>{v.stock?`${v.stock} en stock`:"Épuisé"}</span></div><p className="lead">{product.description}</p><div className="notes" aria-label="Notes olfactives">{product.notes.map(n=><span key={n}>{n}</span>)}</div><hr/><h3>Choisir votre format</h3><div className="variants">{product.variants.map(x=><button key={x.id} disabled={!x.stock} onClick={()=>{setVariantId(x.id);setQty(1)}} className={variantId===x.id?"selected":""}><span><em className={`variant-kind variant-kind--${x.kind}`}>{x.kind==="bottle"?"Flacon original":"Décant"}</em>{x.label}<small>{x.stock?`${x.stock} disponibles`:"Épuisé"}</small></span><b>{money(x.price)}</b></button>)}</div><div className="buy-row"><div className="qty"><button aria-label="Réduire la quantité" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={16}/></button><b>{qty}</b><button aria-label="Augmenter la quantité" onClick={()=>setQty(Math.min(v.stock,qty+1))}><Plus size={16}/></button></div><button className="button grow" onClick={submit} disabled={!v.stock}>{added?<><Check/> Ajouté au panier</>:<><ShoppingBag/> Ajouter · {money(v.price*qty)}</>}</button></div><p className="micro">Paiement à la livraison proposé dans cette démonstration. Aucune transaction réelle.</p></div>
    <div className="mobile-buy"><div><small>{product.name}</small><b>{money(v.price)}</b></div><button className="button" onClick={submit} disabled={!v.stock}>{added?"Ajouté":"Ajouter au panier"}</button></div>
  </section>{related.length>0&&<section className="section related"><div className="section-title"><div><span className="eyebrow">À DÉCOUVRIR AUSSI</span><h2>Dans le même univers.</h2></div></div><div className="product-grid">{related.map(p=><ProductCard key={p.id} p={p}/>)}</div></section>}</>
}
