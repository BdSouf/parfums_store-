"use client";

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDownUp, ArrowRight, Check, ChevronDown, Heart, Scale, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { categories, decantFormats, unitPrice, type Product } from '@/lib/data';
import { catalogQuery, onSale } from '@/lib/catalog-query';
import { useStore } from '@/lib/store';
import { MLink, useMarket } from './market-context';

export function HeritageCard({ product: p, variantId }: { product: Product; variantId?: string }) {
 const s = useStore(), m = useMarket(), { t } = m, reduce = useReducedMotion();
 const [selected, setSelected] = useState(variantId || ''), [added, setAdded] = useState(false);
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
 const v = p.variants.find(x => x.id === (variantId || selected)) || [...p.variants].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || unitPrice(a) - unitPrice(b))[0];
 const favorites = s.customers.find(c => c.id === s.customerId)?.favorites || s.guestFavorites;
 const stock = v.stock > 0 && !p.archived, available = v.stock - (s.cart.find(l => l.variantId === v.id)?.quantity || 0);
 const add = () => { const result = m.run({ type: 'cart', id: v.id, quantity: 1 }, t('Ajouté au panier.', 'أُضيف إلى السلة.')); if (!result.error) { setAdded(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setAdded(false), 1400); } };
 return <motion.article className="product-card heritage-card" style={{ '--accent': p.accent } as CSSProperties} whileHover={reduce ? undefined : { y: -6 }} transition={{ duration: .2 }}>
  <div className="product-art"><MLink href={`/produits/${p.slug}?variant=${encodeURIComponent(v.id)}`} className="product-visual"><span className="product-halo" aria-hidden="true" /><Image src={p.image} alt={m.title(p)} fill sizes="(max-width:600px) 50vw, (max-width:1000px) 33vw, 25vw" className="product-photo" />{(p.fictional || onSale(v)) && <em>{p.fictional ? t('Création fictive', 'منتج خيالي') : t('Offre démo', 'عرض تجريبي')}</em>}</MLink>
   <div className="heritage-card-tools"><button className={favorites.includes(p.id) ? 'active' : ''} onClick={() => m.run({ type: 'favorite', id: p.id })} aria-pressed={favorites.includes(p.id)} aria-label={t('Ajouter ou retirer des favoris', 'إضافة أو إزالة من المفضلة')}><Heart size={15} /></button><button className={s.comparison.includes(p.id) ? 'active' : ''} onClick={() => m.run({ type: 'compare', id: p.id })} aria-pressed={s.comparison.includes(p.id)} aria-label={t('Ajouter ou retirer de la comparaison', 'إضافة أو إزالة من المقارنة')}><Scale size={15} /></button></div>
   <button className={added ? 'quick-add added' : 'quick-add'} onClick={add} disabled={!s.ready || !stock || available <= 0} aria-label={`${t('Ajouter', 'أضف')} ${m.title(p)}, ${v.label}, ${m.price(unitPrice(v))}`}>{added ? <><Check />{t('Ajouté', 'أُضيف')}</> : <><ShoppingBag />{t('Ajouter', 'أضف')}</>}</button>
  </div>
  <div className="product-meta"><div className="product-brand"><small>{p.brand}</small><span className={stock ? 'stock' : 'stock out'}>{stock ? t('En stock', 'متوفر') : t('Épuisé', 'نفد')}</span></div><MLink href={`/produits/${p.slug}?variant=${encodeURIComponent(v.id)}`}><h3>{m.title(p)}</h3></MLink>
   {variantId ? <p>{v.kind === 'decant' ? t('Décant', 'حجم صغير') : t('Flacon', 'زجاجة')} · {v.label}</p> : <label className="heritage-card-format"><span className="heritage-sr-only">{t('Format', 'الحجم')}</span><select value={v.id} onChange={e => { setSelected(e.target.value); setAdded(false); }}>{p.variants.map(x => <option value={x.id} key={x.id}>{x.kind === 'decant' ? t('Décant', 'حجم صغير') : t('Flacon', 'زجاجة')} · {x.label}</option>)}</select></label>}
   <strong>{onSale(v) && <del>{m.price(v.referencePrice!)} </del>}{m.price(unitPrice(v))}</strong>
  </div>
 </motion.article>;
}

export function HeritageCatalog() {
 const s = useStore(), m = useMarket(), { t } = m, params = useSearchParams(), router = useRouter(), reduce = useReducedMotion();
 const [filters, setFilters] = useState(false);
 const searchId = useId(), searchInput = useRef<HTMLInputElement>(null);
 const result = catalogQuery(s, new URLSearchParams(params.toString()));
 const change = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.delete('page'); router.replace(m.href(`/produits?${next}`), { scroll: false }); };
 const unique = (values: (string | undefined)[]) => [...new Set(values.filter((x): x is string => !!x))].sort();
 const select = (key: string, fr: string, ar: string, values: string[]) => <label>{t(fr, ar)}<select value={params.get(key) || ''} onChange={e => change(key, e.target.value)}><option value="">{t('Tous', 'الكل')}</option>{values.map(v => <option value={v} key={v}>{m.term(v)}</option>)}</select></label>;
 const extra = <div className="market-app heritage-tools"><div className="m-grid">{select('brand', 'Marque', 'الماركة', unique(s.products.filter(p => !p.archived).map(p => p.brand)))}{select('profile', 'Pour qui', 'لمن', ['homme', 'femme', 'mixte'])}{select('family', 'Famille olfactive', 'العائلة العطرية', unique(s.products.map(p => p.family)))}{select('concentration', 'Concentration', 'التركيز', unique(s.products.map(p => p.concentration)))}{select('note', 'Note', 'النفحة', unique(s.products.flatMap(p => p.notes)))}<label>{t('Format de décant', 'حجم الديكانت')}<select value={params.get('format') || ''} onChange={e => change('format', e.target.value)}><option value="">{t('Tous', 'الكل')}</option>{decantFormats.map(v => <option key={v} value={v}>{v} ml</option>)}</select></label><label>{t('Conditionnement', 'نوع العبوة')}<select value={params.get('type') || ''} onChange={e => change('type', e.target.value)}><option value="">{t('Tous', 'الكل')}</option><option value="bottle">{t('Flacon', 'زجاجة')}</option><option value="decant">{t('Décant', 'حجم صغير')}</option></select></label><label>{t('Budget minimum (MAD)', 'أدنى ميزانية بالدرهم')}<input type="number" min="0" step="0.01" value={params.get('min') || ''} onChange={e => change('min', e.target.value)} /></label><label>{t('Budget maximum (MAD)', 'أقصى ميزانية بالدرهم')}<input type="number" min="0" step="0.01" value={params.get('max') || ''} onChange={e => change('max', e.target.value)} /></label>{select('season', 'Saison', 'الموسم', ['ete', 'hiver'])}<label className="m-check"><input type="checkbox" checked={params.get('stock') === '1'} onChange={e => change('stock', e.target.checked ? '1' : '')} />{t('En stock uniquement', 'المتوفر فقط')}</label><label className="m-check"><input type="checkbox" checked={params.get('promo') === '1'} onChange={e => change('promo', e.target.checked ? '1' : '')} />{t('En promotion', 'التخفيضات')}</label></div></div>;
 const category = params.get('category') || 'Tous';
 const chips = [...params.entries()].filter(([k]) => !['lang', 'sort', 'page', 'category', 'q'].includes(k));
 return <div className="nocturne-home catalog-nocturne catalog-compact heritage-catalog">
  <section className="catalog-stage" aria-label={t('Liste des produits', 'قائمة المنتجات')}>
   <header className="catalog-heading"><div><span className="nocturne-kicker">{t('LA COLLECTION LA7YA', 'مجموعة La7ya')}</span><h1>{t('Tous les parfums', 'جميع العطور')}<span>.</span></h1></div><p>{t('Flacons et décants. Trouvez le parfum qui vous ressemble.', 'زجاجات وأحجام صغيرة. اعثر على العطر الذي يشبهك.')}</p></header>
   <div className="catalog-tools heritage-search-toolbar">
    <div className="heritage-search-field" role="search" aria-label={t('Recherche dans la collection', 'البحث في المجموعة')}>
     <span className="heritage-search-symbol" aria-hidden="true"><Search size={21} strokeWidth={1.5} /></span>
     <div className="heritage-search-copy"><label htmlFor={searchId}>{t('Trouvez votre signature', 'اعثر على عطرك المميز')}</label><input ref={searchInput} id={searchId} type="search" autoComplete="off" spellCheck={false} value={params.get('q') || ''} aria-label={t('Rechercher dans le catalogue', 'بحث في المجموعة')} onChange={e => change('q', e.target.value)} placeholder={t('Un parfum, une maison, une note…', 'عطر، ماركة، نفحة…')} /></div>
     {!!params.get('q') && <button className="heritage-search-clear" onClick={() => { change('q', ''); searchInput.current?.focus(); }} aria-label={t('Effacer la recherche', 'مسح البحث')} title={t('Effacer', 'مسح')}><X size={16} /></button>}
    </div>
    <button className="mobile-filter-trigger" onClick={() => setFilters(true)} aria-label={t('Ouvrir les filtres', 'فتح المرشحات')}><SlidersHorizontal size={17} />{t('Filtres', 'المرشحات')}</button>
    <label className="heritage-sort"><ArrowDownUp size={18} strokeWidth={1.5} aria-hidden="true" /><span className="heritage-sort-copy"><span>{t('Trier la collection', 'ترتيب المجموعة')}</span><select value={params.get('sort') || 'new'} aria-label={t('Trier les produits', 'ترتيب المنتجات')} onChange={e => change('sort', e.target.value)}>{[['new', t('Nouveautés', 'الأحدث')], ['low', t('Prix croissant', 'السعر تصاعدياً')], ['high', t('Prix décroissant', 'السعر تنازلياً')], ['best', t('Ventes démo', 'مبيعات تجريبية')]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></span><ChevronDown size={14} aria-hidden="true" /></label>
   </div>
   <div className="chips desktop-chips" aria-label={t('Filtres du catalogue', 'مرشحات المجموعة')}>{categories.filter(c => params.get('type') !== 'bottle' || c !== 'Décants').map(c => <button className={category === c ? 'active' : ''} aria-pressed={category === c} key={c} onClick={() => change('category', c === 'Tous' ? '' : c)}>{m.term(c)}</button>)}{category === 'Décants' && decantFormats.map(v => <button key={v} className={params.get('format') === String(v) ? 'active format-chip' : 'format-chip'} onClick={() => change('format', String(v))}>{v} ml</button>)}</div>
   <details className="heritage-advanced"><summary>{t('Affiner la sélection', 'تصفية الاختيار')} <SlidersHorizontal size={13} /></summary>{extra}</details>
   {(chips.length > 0 || params.get('q') || params.get('category')) && <div className="heritage-active-filters">{chips.map(([key, value]) => <button key={key} onClick={() => change(key, '')}>{m.term(value)} <X size={11} /></button>)}<MLink href="/produits">{t('Réinitialiser', 'إعادة التعيين')} ×</MLink></div>}
   <div className="result-line"><b><span>{String(result.rows.length).padStart(2, '0')}</span>{t('produits', 'منتجات')}</b><span>{t('Flacons et décants · catalogue de démonstration', 'زجاجات وأحجام صغيرة · مجموعة تجريبية')}</span></div>
   <motion.div layout className="product-grid catalog-grid"><AnimatePresence mode="popLayout">{result.visible.map(({ product, variant }, i) => <motion.div layout key={`${product.id}-${variant.id}`} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} transition={{ duration: reduce ? 0 : .28, delay: Math.min(i * .025, .15) }}><HeritageCard product={product} variantId={variant.id} /></motion.div>)}</AnimatePresence></motion.div>
   {!result.rows.length && <div className="empty catalog-empty"><span className="nocturne-kicker">{t('AUCUN RÉSULTAT', 'لا نتائج')}</span><h2>{t('Aucun parfum trouvé.', 'لم يُعثر على عطر.')}</h2><p>{t('Modifiez votre recherche ou réinitialisez les filtres.', 'عدّل البحث أو أعد تعيين المرشحات.')}</p><MLink className="nocturne-cta" href="/produits">{t('Voir tous les parfums', 'عرض جميع العطور')}<ArrowRight size={16} /></MLink></div>}
   <nav className="heritage-pagination" aria-label={t('Pagination', 'الصفحات')}><button disabled={result.page <= 1} onClick={() => change('page', String(result.page - 1))}>{t('Précédent', 'السابق')}</button><span>{result.page} / {result.pages}</span><button disabled={result.page >= result.pages} onClick={() => change('page', String(result.page + 1))}>{t('Suivant', 'التالي')}</button></nav>
  </section>
  <AnimatePresence>{filters && <motion.div className="filter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilters(false)}><motion.div className="filter-drawer heritage-filter-drawer" initial={reduce ? false : { y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t('Filtres', 'المرشحات')}><header><div><span className="nocturne-kicker">{t('AFFINER LA SÉLECTION', 'تصفية الاختيار')}</span><h2>{t('Filtrer', 'تصفية')}</h2></div><button autoFocus onClick={() => setFilters(false)} aria-label={t('Fermer les filtres', 'إغلاق المرشحات')}><X /></button></header><div className="filter-options">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => change('category', c === 'Tous' ? '' : c)}>{m.term(c)}</button>)}</div>{extra}<button className="nocturne-cta filter-apply" onClick={() => setFilters(false)}>{t('Afficher', 'عرض')} {result.rows.length} {t('produits', 'منتجات')}</button></motion.div></motion.div>}</AnimatePresence>
 </div>;
}
