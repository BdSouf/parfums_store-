"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LanguageSwitch, MLink, useMarket } from './market-context';
import purchaseStyles from './purchase-shell.module.css';
import { ThemeToggle } from './theme-toggle';

function Brand({ inverse = false }: { inverse?: boolean }) {
 return <span className={inverse ? 'brand-mark inverse' : 'brand-mark'}><Image className="brand-logo" src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={180} height={103} priority /></span>;
}

function HeritageHeader() {
 const s = useStore(), m = useMarket(), { t } = m;
 const [open, setOpen] = useState(false), [search, setSearch] = useState(false), [scrolled, setScrolled] = useState(false);
 const dialog = useRef<HTMLDivElement>(null);
 const opener = useRef<HTMLElement | null>(null);
 const reduce = useReducedMotion(), count = s.cart.reduce((n, l) => n + l.quantity, 0);
 const links = [
  ['/', t('Accueil', 'الرئيسية')], ['/produits', t('Tous les parfums', 'جميع العطور')],
  ['/produits?category=Grandes%20marques', t('Grandes marques', 'الماركات الكبرى')], ['/produits?category=Parfums%20de%20niche', t('Parfums de niche', 'عطور النيش')], ['/produits?category=Parfums%20arabes', t('Parfums arabes', 'العطور العربية')],
  ['/marques', t('Toutes les maisons', 'جميع الماركات')], ['/coffrets', t('Coffrets', 'علب الهدايا')], ['/quiz', t('Trouver mon parfum', 'ابحث عن عطري')], ['/favoris', t('Mes favoris', 'المفضلة')], ['/comparateur', t('Comparer les parfums', 'مقارنة العطور')], ['/compte', t('Mon compte', 'حسابي')], ['/cadeaux', t('Cartes cadeaux', 'بطاقات الهدايا')], ['/admin', t('Espace administrateur', 'الإدارة')]
 ];
 useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 28); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
 useEffect(() => {
  if (!open && !search) return;
  const trigger = opener.current;
  const overflow = document.body.style.overflow, htmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden';
  const onKey = (e: KeyboardEvent) => {
   if (e.key === 'Escape') { setOpen(false); setSearch(false); }
   if (e.key !== 'Tab') return;
   const container = open ? dialog.current : document.querySelector('.search-overlay');
   const items = container?.querySelectorAll<HTMLElement>('a[href], button, input:not([type="hidden"])');
   if (!items?.length) return;
   const first = items[0], last = items[items.length - 1];
   if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
   else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  window.addEventListener('keydown', onKey);
  return () => { document.body.style.overflow = overflow; document.documentElement.style.overflow = htmlOverflow; window.removeEventListener('keydown', onKey); trigger?.focus(); };
 }, [open, search]);
 return <>
  <header className={`header heritage-header${scrolled ? ' scrolled' : ''}`} onClickCapture={e => { const target = (e.target as Element).closest<HTMLElement>('button'); if (target) opener.current = target; }}>
   <div className="heritage-navigation"><button onClick={() => setOpen(true)} className="heritage-menu-toggle" aria-label={t('Ouvrir le menu', 'فتح القائمة')} aria-expanded={open} aria-controls="heritage-menu"><Menu size={19} /><span>{t('Menu', 'القائمة')}</span></button><nav className="heritage-primary" aria-label={t('Navigation principale', 'التنقل الرئيسي')}><MLink href="/produits">{t('Parfums', 'العطور')}</MLink><MLink href="/coffrets">{t('Coffrets', 'الهدايا')}</MLink></nav></div>
   <MLink href="/" className="header-brand" aria-label={t('La7ya Store, accueil', 'La7ya Store، الرئيسية')}><Brand /></MLink>
   <div className="actions"><LanguageSwitch /><ThemeToggle /><button className="heritage-icon" onClick={() => setSearch(true)} aria-label={t('Ouvrir la recherche', 'فتح البحث')} title={t('Rechercher', 'بحث')}><Search size={19} /></button><MLink href="/compte" className="heritage-icon heritage-account" aria-label={t('Mon compte', 'حسابي')} title={t('Mon compte', 'حسابي')}><UserRound size={19} /></MLink><MLink href="/panier" className="bag heritage-icon" aria-label={`${t('Panier', 'السلة')}, ${count}`} title={t('Panier', 'السلة')}><ShoppingBag size={19} />{count > 0 && <motion.b key={count} initial={reduce ? false : { scale: .5 }} animate={{ scale: 1 }}>{count}</motion.b>}</MLink></div>
  </header>
  <AnimatePresence>
   {open && <motion.div className="heritage-menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden="true" />}
   {open && <motion.div ref={dialog} id="heritage-menu" className="heritage-drawer" initial={reduce ? false : { x: m.lang === 'ar' ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: m.lang === 'ar' ? '100%' : '-100%' }} transition={{ duration: reduce ? 0 : .35, ease: [.22, 1, .36, 1] }} role="dialog" aria-modal="true" aria-label={t('Menu de la boutique', 'قائمة المتجر')}><div className="drawer-head"><Brand /><button autoFocus onClick={() => setOpen(false)} aria-label={t('Fermer', 'إغلاق')}><X size={20} /></button></div><div className="heritage-menu-scroll">{[{ heading: t('La collection', 'المجموعة'), items: links.slice(0, 7) }, { heading: t('Votre expérience', 'تجربتك'), items: links.slice(7, 12) }].map(({ heading, items }) => <section key={heading}><h2>{heading}</h2><nav aria-label={heading}>{items.map(([href, label]) => <MLink href={href} key={href} onClick={() => setOpen(false)}><span>{label}</span><ArrowRight size={17} /></MLink>)}</nav></section>)}<MLink href="/admin" className="heritage-menu-admin" onClick={() => setOpen(false)}>{t('Espace administrateur démo', 'إدارة العرض التجريبي')}<ArrowRight size={14} /></MLink><div className="heritage-mobile-theme"><ThemeToggle /><span>{t('Apparence', 'المظهر')}</span></div><p className="heritage-menu-note">{t('Démonstration commerciale · Rabat', 'عرض تجاري تجريبي · الرباط')}</p></div></motion.div>}
   {search && <motion.div className="search-overlay" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={t('Recherche', 'بحث')}><button className="search-close" onClick={() => setSearch(false)} aria-label={t('Fermer', 'إغلاق')}><X /></button><motion.div initial={reduce ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><span className="eyebrow">{t('RECHERCHE', 'بحث')}</span><form action="/produits" onSubmit={() => setSearch(false)}><input type="hidden" name="lang" value={m.lang} /><input autoFocus name="q" placeholder={t('Quel parfum recherchez-vous ?', 'أي عطر تبحث عنه؟')} /><button aria-label={t('Rechercher', 'بحث')}><ArrowRight /></button></form><p>{t('Essayez « Dior », « Xerjoff » ou « Lattafa »', 'جرّب « Dior » أو « Xerjoff » أو « Lattafa »')}</p></motion.div></motion.div>}
  </AnimatePresence>
 </>;
}

function HeritageFooter() {
 const m = useMarket(), { t } = m;
 const [email, setEmail] = useState('visiteur@example.test');
 return <footer className="heritage-footer"><div><MLink href="/" aria-label={t('Accueil', 'الرئيسية')}><Brand inverse /></MLink><p>{t('Une expérience de parfumerie contemporaine imaginée pour La7ya Store à Rabat.', 'تجربة عطور معاصرة صُممت لـ La7ya Store في الرباط.')}</p></div><div><h4>{t('Découvrir', 'اكتشف')}</h4>{[['/produits', t('Tous les produits', 'جميع المنتجات')], ['/produits?category=Parfums%20de%20niche', t('Parfums de niche', 'عطور النيش')], ['/produits?category=Parfums%20arabes', t('Parfums arabes', 'العطور العربية')], ['/coffrets', t('Coffrets', 'علب الهدايا')], ['/quiz', t('Trouver mon parfum', 'ابحث عن عطري')], ['/compte', t('Mon compte', 'حسابي')], ['/favoris', t('Favoris', 'المفضلة')], ['/comparateur', t('Comparer', 'قارن')], ['/cadeaux', t('Cartes cadeaux', 'بطاقات الهدايا')]].map(([href, text]) => <MLink href={href} key={href}>{text}</MLink>)}</div><div><h4>{t('Informations', 'معلومات')}</h4><p>{t('Galerie La Jeunesse', 'غاليري لا جونيس')}<br />{t('Avenue Hassan II, Rabat', 'شارع الحسن الثاني، الرباط')}</p><p>{t('Démonstration non officielle. Marques, prix et disponibilité à confirmer avant production.', 'عرض غير رسمي. تُراجع الماركات والأسعار والتوفر قبل الإنتاج.')}</p><div className="heritage-footer-links">{[['/guides', t('Guides', 'أدلة')], ['/informations/livraison', t('Livraison', 'التوصيل')], ['/informations/retours', t('Retours', 'الإرجاع')], ['/informations/contact', t('Contact', 'تواصل')], ['/informations/confidentialite', t('Confidentialité', 'الخصوصية')], ['/notifications', t('Messages simulés', 'رسائل تجريبية')], ['/demo', t('Outils démo', 'أدوات العرض')], ['/admin', t('Administration', 'الإدارة')]].map(([href, text]) => <MLink href={href} key={href}>{text}</MLink>)}</div><details className="heritage-newsletter"><summary>{t('La lettre La7ya', 'رسالة La7ya')}</summary><form onSubmit={e => { e.preventDefault(); m.run({ type: 'subscribe', email }); }}><label>{t('Adresse de test', 'بريد تجريبي')}<input type="email" value={email} required onChange={e => setEmail(e.target.value)} /></label><button className="nocturne-cta">{t('M’inscrire (simulation)', 'اشتراك (محاكاة)')}</button><small>{t('Aucun email envoyé.', 'لا يُرسل أي بريد.')}</small></form></details></div></footer>;
}

export function MarketShell({ children }: { children: React.ReactNode }) {
 const s = useStore(), m = useMarket(), { t } = m, path = usePathname();
 const admin = path.startsWith('/admin'), purchase = path === '/panier' || path === '/commande' || path.startsWith('/commande/confirmation/');
 const originalPage = path === '/' || path.startsWith('/produits') || purchase || admin;
 return <div className={`app-shell nocturne-shell ${admin ? 'admin-shell' : purchase ? 'purchase-shell' : 'storefront-shell'}`}>
  {purchase ? <header className={`${purchaseStyles.header} ${purchaseStyles.themeScope}`}><MLink href="/" className={purchaseStyles.logo} aria-label={t('La7ya Store, accueil', 'La7ya Store، الرئيسية')}><Image src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={120} height={70} priority /></MLink><div className={purchaseStyles.headerActions}><span>MAISON LA7YA · RABAT</span><LanguageSwitch /><ThemeToggle /></div></header> : !admin && <HeritageHeader />}
  {admin && <div className="heritage-admin-language"><LanguageSwitch /><ThemeToggle /></div>}
  {s.storageError && <div className="m-alert" role="alert">{m.error(s.storageError)} <MLink href="/demo">{t('Outils de démonstration', 'أدوات العرض')}</MLink></div>}
  <main id="main-content">{originalPage ? children : <div className="market-app heritage-services">{children}</div>}</main>
  {purchase ? <footer className={`${purchaseStyles.footer} ${purchaseStyles.themeScope}`}><span>LA7YA STORE · RABAT</span><span>{t('Parcours de démonstration · aucune transaction réelle', 'مسار تجريبي · دون معاملات حقيقية')}</span></footer> : !admin && <HeritageFooter />}
 </div>;
}
