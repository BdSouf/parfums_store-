"use client";
import { HeritageHome } from './heritage-home';
import { HeritageDetail } from './heritage-detail';
import { HeritageCard, HeritageCatalog } from './heritage-catalog';
import { useState, type FormEvent } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/data';
import { catalogQuery } from '@/lib/catalog-query';
import { useStore } from '@/lib/store';
import { MLink, useMarket } from './market-context';

export function Heading({ title, subtitle }: { title: string; subtitle?: string }) { const { t } = useMarket(); return <div className="m-intro"><div><span className="m-kicker">LA7YA · {t('LA COLLECTION', 'المجموعة')}</span><h1>{title}</h1></div>{subtitle && <p>{subtitle}</p>}</div>; }
export function Empty({ text }: { text?: string }) { const { t } = useMarket(); return <div className="m-empty"><ShoppingBag size={30} /><h2>{text || t('Votre sélection commence ici.', 'ابدأ اختيارك هنا.')}</h2><MLink className="m-button" href="/produits">{t('Explorer la collection', 'استكشف المجموعة')}</MLink></div>; }

export function MarketCard(props: { product: Product; variantId?: string }) { return <HeritageCard {...props} />; }

export function HomeView() { return <HeritageHome />; }

export function CatalogView() { return <HeritageCatalog />; }

export function DetailView(props: { product: Product }) { return <HeritageDetail {...props} />; }

export function SavedView({ compare = false }: { compare?: boolean }) {
 const s = useStore(), m = useMarket(), { t } = m;
 const ids = compare ? s.comparison : s.customers.find(c => c.id === s.customerId)?.favorites || s.guestFavorites;
 const products = s.products.filter(p => ids.includes(p.id) && !p.archived);
 return <div className="m-wrap"><Heading title={compare ? t('Vos parfums, côte à côte.', 'عطورك جنباً إلى جنب.') : t('Vos coups de cœur.', 'عطورك المفضلة.')} subtitle={compare ? t('Deux ou trois références. Les informations inconnues restent non renseignées.', 'مرجعان أو ثلاثة. المعلومات غير المعروفة تبقى غير موثقة.') : t('Une sélection conservée dans ce navigateur.', 'اختيارات محفوظة في هذا المتصفح.')} />{!products.length ? <Empty /> : <><div className="m-grid three">{products.map(p => <div key={p.id}><MarketCard product={p} /><button className="m-subtle" onClick={() => m.run({ type: compare ? 'compare' : 'favorite', id: p.id })}>{t('Retirer', 'إزالة')}</button></div>)}</div>{compare && products.length < 2 && <p className="m-tip">{t('Ajoutez un deuxième parfum pour comparer.','أضف عطراً ثانياً للمقارنة.')}</p>}{compare && products.length >= 2 && <div className="m-table-wrap m-spaced"><table className="m-table"><caption>{t('Comparaison des caractéristiques renseignées', 'مقارنة الخصائص الموثقة')}</caption><thead><tr><th>{t('Caractéristique', 'الخاصية')}</th>{products.map(p => <th key={p.id}>{m.title(p)}</th>)}</tr></thead><tbody>{['brand', 'profile', 'family', 'concentration', 'notes'].map(key => <tr key={key}><th>{({ brand: t('Marque', 'الماركة'), profile: t('Profil', 'الملف'), family: t('Famille', 'العائلة'), concentration: t('Concentration', 'التركيز'), notes: t('Notes', 'النفحات') })[key]}</th>{products.map(p => <td key={p.id}>{Array.isArray(p[key as keyof Product]) ? (p[key as keyof Product] as string[]).map(m.term).join(' · ') : m.term(String(p[key as keyof Product] || t('Non renseigné', 'غير موثق')))}</td>)}</tr>)}</tbody></table></div>}</>}</div>;
}

export function BrandsView() { const s = useStore(), m = useMarket(), { t } = m; const brands = [...new Set(s.products.filter(p => !p.archived).map(p => p.brand))].sort(); return <div className="m-wrap"><Heading title={t('Les maisons.', 'الماركات.')} /><div className="m-grid three">{brands.map(b => <MLink key={b} className="m-panel" href={`/produits?brand=${encodeURIComponent(b)}`}><span className="m-kicker">{t('LA COLLECTION', 'المجموعة')}</span><h2>{b}</h2><small>{s.products.filter(p => !p.archived && p.brand === b).length} {t('références', 'منتجات')}</small></MLink>)}</div></div>; }

export function QuizView() {
 const s = useStore(), m = useMarket(), { t } = m;
 const [answers, setAnswers] = useState({ profile: '', family: '', note: '', max: '', format: '' }), [show, setShow] = useState(false);
 const params = new URLSearchParams({ ...answers, stock: '1' }), result = catalogQuery(s, params).rows.slice(0, 3);
 const options = [{ key: 'profile', fr: 'Pour qui ?', ar: 'لمن؟', values: ['homme', 'femme', 'mixte'] }, { key: 'family', fr: 'Quelle famille ?', ar: 'أي عائلة؟', values: [...new Set(s.products.map(p => p.family).filter((v): v is string => !!v))] }, { key: 'note', fr: 'Quelle note ?', ar: 'أي نفحة؟', values: [...new Set(s.products.flatMap(p => p.notes))].sort() }, { key: 'max', fr: 'Budget maximum en MAD', ar: 'أقصى ميزانية بالدرهم', values: ['50', '100', '300', '600', '1500'] }, { key: 'format', fr: 'Quel format de décant ?', ar: 'أي حجم صغير؟', values: ['2', '5', '10', '20'] }];
 function submit(e: FormEvent) { e.preventDefault(); setShow(true); }
 return <div className="m-wrap"><Heading title={t('Votre prochaine rencontre.', 'اكتشافك القادم.')} subtitle={t('Cinq questions. Des correspondances expliquées, sans score inventé.', 'خمسة أسئلة. نتائج مُفسّرة دون نسب توافق مختلقة.')} /><form className="m-panel m-stack" onSubmit={submit}>{options.map((o, i) => <label key={o.key}>{i + 1}. {t(o.fr, o.ar)}<select value={answers[o.key as keyof typeof answers]} onChange={e => { setAnswers({ ...answers, [o.key]: e.target.value }); setShow(false); }}><option value="">{t('Peu importe / je ne sais pas', 'لا يهم / لا أعرف')}</option>{o.values.map(v => <option key={v} value={v}>{m.term(v)}{o.key === 'format' ? ' ml' : ''}</option>)}</select></label>)}<button className="m-button">{t('Voir mes correspondances', 'عرض النتائج المطابقة')}</button></form>{show && <section className="m-spaced"><h2>{t('Vos résultats', 'نتائجك')}</h2>{result.length ? <><p>{t('Critères retenus :', 'المعايير المختارة:')} {Object.entries(answers).filter(([, v]) => v).map(([k, v]) => `${options.find(o => o.key === k) ? t(options.find(o => o.key === k)!.fr, options.find(o => o.key === k)!.ar) : ''} ${m.term(v)}`).join(' · ') || t('Formats disponibles', 'الأحجام المتاحة')}</p><div className="m-grid three">{result.map(({ product, variant }) => <MarketCard key={product.id} product={product} variantId={variant.id} />)}</div></> : <div className="m-panel"><p>{t('Aucune correspondance exacte. Retirez explicitement un critère :', 'لا توجد مطابقة تامة. أزل معياراً بشكل صريح:')}</p><div className="m-row">{options.filter(o => answers[o.key as keyof typeof answers]).map(o => <button key={o.key} className="m-chip" onClick={() => setAnswers({ ...answers, [o.key]: '' })}>{t(o.fr, o.ar)} ×</button>)}</div><p>{t('Validez à nouveau après modification.', 'أعد التأكيد بعد التعديل.')}</p></div>}</section>}</div>;
}
