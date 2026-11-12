"use client";

import Image from 'next/image';
import { ArrowRight, Layers3, MoonStar, Sparkles } from 'lucide-react';
import { isBottleVariant, isDecantVariant, unitPrice } from '@/lib/data';
import { useStore } from '@/lib/store';
import { MLink, useMarket } from './market-context';

// Preserve the incoming editorial selections, separately from the purchasable
// three x 5 ml boxes. Their links lead to the matching live catalogue filters.
export function HeritageSelections() {
 const s = useStore(), m = useMarket(), { t } = m;
 const products = s.products.filter(p => !p.archived);
 const selections = [
  { id: 'discovery', label: t('Découverte', 'اكتشاف'), title: t('Découverte Décant', 'اكتشاف الأحجام الصغيرة'), description: t('Trois signatures en 10 ml pour explorer et comparer.', 'ثلاثة عطور بحجم 10 مل للاكتشاف والمقارنة.'), slugs: ['dior-sauvage-edp','xerjoff-naxos','lattafa-khamrah'], decant: true, href: '/produits?type=decant&format=10', icon: <Sparkles /> },
  { id: 'icons', label: t('Flacons complets', 'زجاجات كاملة'), title: t('Icônes en flacon', 'عطور أيقونية'), description: t('Trois maisons réunies dans une sélection élégante et contrastée.', 'ثلاث ماركات في مجموعة أنيقة ومتنوعة.'), slugs: ['bleu-de-chanel-edp','xerjoff-naxos','armani-stronger-with-you-intensely'], decant: false, href: '/produits?type=bottle', icon: <Layers3 /> },
  { id: 'arabic', label: t('Sélection arabe', 'اختيارات عربية'), title: t('Signature Arabe', 'بصمة عربية'), description: t('Une sélection parmi les créations arabes du catalogue.', 'مجموعة من العطور العربية المتاحة في الكتالوج.'), slugs: ['lattafa-khamrah','afnan-9pm','armaf-club-de-nuit-intense-man'], decant: false, href: '/produits?category=Parfums%20arabes&type=bottle', icon: <MoonStar /> }
 ];
 return <section id="packs" className="pack-showcase"><header className="pack-showcase-heading"><div><span className="nocturne-kicker">{t('LA SÉLECTION LA7YA', 'اختيارات La7ya')}</span><h2>{t('Nos sélections', 'اختياراتنا')} <i>La7ya.</i></h2><p>{t('Des compositions pour découvrir, collectionner ou offrir.', 'اختيارات للاكتشاف أو الاقتناء أو الإهداء.')}</p></div><MLink href="/coffrets" className="pack-all-link">{t('Composer un coffret', 'تكوين علبة')}<ArrowRight /></MLink></header><div className="pack-grid">{selections.map(selection => {
  const items = selection.slugs.flatMap(slug => products.find(p => p.slug === slug) || []);
  const variants = items.map(p => p.variants.find(v => selection.decant ? isDecantVariant(v, 10) : isBottleVariant(v)));
  const ready = items.length === 3 && variants.every(v => v && v.stock > 0);
  const total = variants.reduce((sum, v) => sum + (v ? Math.round(unitPrice(v) * 100) : 0), 0);
  return <article className={`pack-card pack-card-${selection.id}`} key={selection.id}><div className="pack-card-visual"><span className="pack-card-label">{selection.icon}{selection.label}</span>{selection.decant ? <Image className="pack-decant-visual" src="/images/decants-studio-demo.png" alt={t('Visuel de démonstration de décants', 'صورة تجريبية لأحجام صغيرة')} fill sizes="(max-width:900px) 80vw, 31vw" /> : <div className="pack-products">{items.map(p => <span className="pack-product" key={p.id}><Image src={p.image} alt={m.title(p)} fill sizes="(max-width:900px) 24vw, 10vw" /></span>)}</div>}<div className="pack-card-glow" /></div><div className="pack-card-body"><span className="pack-count">{items.length} {t('références', 'عطور')} · {selection.decant ? '10 ml' : t('flacons complets', 'زجاجات كاملة')}</span><h3>{selection.title}</h3><p>{selection.description}</p><div className="pack-card-bottom"><div><small>{t('Valeur démo de la sélection', 'القيمة التجريبية للمجموعة')}</small><strong>{ready ? m.price(total / 100) : t('À composer', 'تُكوّن حسب التوفر')}</strong></div><MLink href={selection.href}>{t('Voir les formats', 'عرض الأحجام')}<ArrowRight /></MLink></div></div></article>;
 })}</div><p className="pack-footnote">{t('Sélections éditoriales aux prix fictifs actuels, sans stock distinct. Les coffrets personnalisables utilisent trois décants de 5 ml.', 'اختيارات تحريرية بالأسعار الافتراضية الحالية دون مخزون مستقل. تتكون العلب القابلة للتخصيص من ثلاثة أحجام سعة 5 مل.')}</p></section>;
}
