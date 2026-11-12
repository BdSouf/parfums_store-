"use client";

import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { categories, decantFormats, isBottleVariant, isDecantVariant } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export default function ProductsPage() {
  const params = useSearchParams();
  return <ProductsCatalog key={params.toString()} params={params} />;
}

function ProductsCatalog({ params }: { params: Pick<URLSearchParams, "get"> }) {
  const { products: allProducts } = useStore();
  const products = useMemo(() => allProducts.filter(product => !product.archived), [allProducts]);
  const initialCategory = params.get("category") || "Tous";
  const initialFormat = Number(params.get("format"));
  const type = params.get("type") === "bottle" ? "bottle" : "";
  const [category, setCategory] = useState(initialCategory);
  const [format, setFormat] = useState(decantFormats.includes(initialFormat as (typeof decantFormats)[number]) ? initialFormat : 0);
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState("new");
  const [filters, setFilters] = useState(false);
  const reduce = useReducedMotion();
  const visibleCategories = type === "bottle" ? categories.filter((item) => item !== "Décants") : categories;

  const list = useMemo(() => products.flatMap((product) => {
    const decantVariant = product.variants.find((variant) => isDecantVariant(variant, format || undefined) && variant.stock > 0);
    const bottleVariant = product.variants.find((variant) => isBottleVariant(variant) && variant.stock > 0);
    const matchesCategory = category === "Tous" || (category === "Décants" ? Boolean(decantVariant) : product.category === category);
    const matchesFormat = !format || Boolean(decantVariant);
    const matchesType = type !== "bottle" || Boolean(bottleVariant);
    const matchesSearch = `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(q.toLowerCase());
    const variantId = category === "Décants" || format ? decantVariant?.id : type === "bottle" ? bottleVariant?.id : undefined;
    return matchesCategory && matchesFormat && matchesType && matchesSearch ? [{ product, variantId }] : [];
  }).sort((a, b) => {
    const priceA = a.variantId ? a.product.variants.find((variant) => variant.id === a.variantId)!.price : Math.min(...a.product.variants.map((variant) => variant.price));
    const priceB = b.variantId ? b.product.variants.find((variant) => variant.id === b.variantId)!.price : Math.min(...b.product.variants.map((variant) => variant.price));
    return sort === "low" ? priceA - priceB : sort === "high" ? priceB - priceA : 0;
  }), [category, format, q, sort, type, products]);

  const chooseCategory = (value: string) => {
    setCategory(value);
    if (value !== "Décants") setFormat(0);
  };
  const reset = () => { setCategory("Tous"); setFormat(0); setQ(""); setSort("new"); };
  const context = category === "Décants"
    ? `Décants ${format ? `${format} ml` : "tous formats"} · disponibilités du catalogue`
    : type === "bottle" ? "Parfums disponibles en flacon complet" : "Flacons originaux et décants";

  return <div className="nocturne-home catalog-nocturne catalog-compact">
    <section className="catalog-stage" aria-label="Liste des produits">
      <header className="catalog-heading">
        <div><span className="nocturne-kicker">LA COLLECTION LA7YA</span><h1>Tous les parfums<span>.</span></h1></div>
        <p>Flacons et décants. Trouvez le parfum qui vous ressemble.</p>
      </header>

      <div className="catalog-tools">
        <label className="searchbox" aria-label="Rechercher dans le catalogue"><Search size={19} /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Rechercher un parfum, une marque…" /></label>
        <button className="mobile-filter-trigger" onClick={() => setFilters(true)} aria-label="Ouvrir les filtres"><SlidersHorizontal /> Filtres</button>
        <label className="selectbox"><SlidersHorizontal size={17} /><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier les produits"><option value="new">Nouveautés</option><option value="low">Prix croissant</option><option value="high">Prix décroissant</option></select></label>
      </div>

      <div className="chips desktop-chips" aria-label="Filtres du catalogue">
        {visibleCategories.map((item) => <button className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => chooseCategory(item)} key={item}>{item}</button>)}
        {category === "Décants" && decantFormats.map((item) => <button className={format === item ? "active format-chip" : "format-chip"} aria-pressed={format === item} onClick={() => setFormat(item)} key={item}>{item} ml</button>)}
        {(category !== "Tous" || format || q || sort !== "new") && <button className="catalog-reset" onClick={reset}>Réinitialiser <X size={13} /></button>}
      </div>

      <div className="result-line"><b><span>{String(list.length).padStart(2, "0")}</span> produit{list.length > 1 ? "s" : ""}</b><span>{context}</span></div>

      <motion.div layout className="product-grid catalog-grid">
        <AnimatePresence mode="popLayout">
          {list.map(({ product, variantId }, index) => <motion.div layout key={product.id} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: reduce ? 0 : .28, delay: Math.min(index * .025, .15) }}><ProductCard p={product} variantId={variantId} /></motion.div>)}
        </AnimatePresence>
      </motion.div>

      {!list.length && <div className="empty catalog-empty"><span className="nocturne-kicker">AUCUN RÉSULTAT</span><h2>{category === "Décants" ? "Ce format n’est pas disponible." : "Aucun parfum trouvé."}</h2><p>Modifiez votre recherche ou réinitialisez les filtres pour retrouver toute la collection.</p><button className="nocturne-cta" onClick={reset}>Voir tous les parfums</button></div>}
    </section>

    <AnimatePresence>{filters && <motion.div className="filter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilters(false)}><motion.div className="filter-drawer" initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: reduce ? 0 : .3, ease: [.22, 1, .36, 1] }} onClick={(event) => event.stopPropagation()}><header><div><span className="nocturne-kicker">AFFINER LA SÉLECTION</span><h2>Filtrer</h2></div><button onClick={() => setFilters(false)} aria-label="Fermer les filtres"><X /></button></header><div className="filter-options">{visibleCategories.map((item) => <button className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => chooseCategory(item)} key={item}>{item}</button>)}</div>{category === "Décants" && <div className="filter-formats">{decantFormats.map((item) => <button className={format === item ? "active" : ""} aria-pressed={format === item} onClick={() => setFormat(item)} key={item}>{item} ml</button>)}</div>}<button className="nocturne-cta filter-apply" onClick={() => setFilters(false)}>Afficher {list.length} produits</button><button className="reset-link" onClick={reset}>Tout réinitialiser</button></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
