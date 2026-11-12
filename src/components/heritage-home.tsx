"use client";

import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { decantFormats, isDecantVariant } from '@/lib/data';
import { useStore } from '@/lib/store';
import { MLink, useMarket } from './market-context';
import { HeritageSelections } from './heritage-selections';

// Keep the original homepage composition and its original globals.css selectors.
export function HeritageHome() {
 const s = useStore(), m = useMarket(), { t } = m;
 const reduce = useReducedMotion();
 const [format, setFormat] = useState(10), [slide, setSlide] = useState(0);
 const products = s.products.filter(p => !p.archived);
 const count = products.filter(p => p.variants.some(v => isDecantVariant(v, format) && v.stock > 0)).length;
 const slides = [
  { image: '/products/catalog/xerjoff-naxos.png', alt: 'Naxos · Xerjoff', href: '/produits' },
  { image: '/products/catalog/pdm-layton-cutout.png', alt: 'Layton · Parfums de Marly', href: '/produits?category=Parfums%20de%20niche' },
  { image: '/products/catalog/lattafa-khamrah-cutout.png', alt: 'Khamrah · Lattafa', href: '/produits?category=Parfums%20arabes' }
 ];
 const universes = [
  { title: 'Grandes marques', label: t('Dior · Chanel · YSL', 'Dior · Chanel · YSL'), image: '/products/catalog/armani-stronger-cutout.png' },
  { title: 'Parfums de niche', label: t('Signatures rares', 'بصمات مميزة'), image: '/products/catalog/pdm-layton-cutout.png' },
  { title: 'Parfums arabes', label: t('Tendances du moment', 'اختيارات رائجة'), image: '/products/catalog/lattafa-khamrah-cutout.png' }
 ];
 const defaultTitle = m.lang === 'fr' ? s.content.heroFr === 'L’élégance laisse une trace.' : s.content.heroAr === 'الأناقة تترك أثراً.';
 const defaultIntro = m.lang === 'fr' ? s.content.introFr === 'Flacons et décants. Explorez votre prochaine signature.' : s.content.introAr === 'زجاجات وأحجام صغيرة. اكتشف عطرك القادم.';
 return <div className="nocturne-home heritage-home">
  <section className="nocturne-hero">
   <motion.div key={slides[slide].image} className="nocturne-hero-image" initial={reduce ? false : { opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [.22, 1, .36, 1] }}>
    <Image src={slides[slide].image} alt={slides[slide].alt} fill priority sizes="100vw" />
   </motion.div>
   <div className="nocturne-veil" />
   <button className="hero-arrow hero-arrow-left" aria-label={t('Visuel précédent', 'الصورة السابقة')} onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><ChevronLeft /></button>
   <motion.div className="nocturne-copy" initial={reduce ? false : { opacity: 0, x: -34 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2, duration: .75 }}>
    <span className="nocturne-kicker">MAISON LA7YA · RABAT</span>
    <h1>{defaultTitle && m.lang === 'fr' ? <>L’élégance<br />laisse une trace.</> : defaultTitle && m.lang === 'ar' ? <>الأناقة<br />تترك أثراً.</> : t(s.content.heroFr, s.content.heroAr)}</h1>
    <p>{defaultIntro ? t('Parfums arabes, signatures de niche et objets choisis pour celles et ceux qui ne passent pas inaperçus.', 'عطور عربية وبصمات نيش واختيارات لمن يتركون أثراً لا يُنسى.') : t(s.content.introFr, s.content.introAr)}</p>
    <MLink className="nocturne-cta" href={slides[slide].href}>{t('Explorer la collection', 'استكشف المجموعة')} <ArrowRight /></MLink>
   </motion.div>
   <button className="hero-arrow hero-arrow-right" aria-label={t('Visuel suivant', 'الصورة التالية')} onClick={() => setSlide((slide + 1) % slides.length)}><ChevronRight /></button>
   <div className="hero-dots" role="group" aria-label={t('Visuels de la collection', 'صور المجموعة')}>{slides.map((_, i) => <button key={i} aria-label={`${t('Visuel', 'الصورة')} ${i + 1}`} aria-pressed={slide === i} onClick={() => setSlide(i)}>{slide === i ? <b /> : <i />}</button>)}</div>
  </section>
  <section className="universe-overlap" aria-label={t('Nos univers', 'فئاتنا')}>
   {universes.map((item, i) => <motion.article key={item.title} initial={reduce ? false : { opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}>
    <MLink href={`/produits?category=${encodeURIComponent(item.title)}`}><Image src={item.image} alt="" fill sizes="(max-width:700px) 86vw, 31vw" /><div className="universe-shade" /><span><small>{item.label}</small><strong>{m.term(item.title)}</strong></span><i><ArrowRight /></i></MLink>
   </motion.article>)}
  </section>
  <motion.section id="parfums-en-flacon" className="decant-editorial bottle-editorial" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>
   <motion.div className="decant-editorial-copy" initial={reduce ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .6, delay: .08 }}>
    <span className="nocturne-kicker">{t('LA COLLECTION', 'المجموعة')}</span><h2>{t('L’art du parfum,', 'فن العطر،')}<br /><i>{t('sans compromis.', 'دون مساومة.')}</i></h2>
    <p>{t('Découvrez les grandes maisons, les signatures de niche et les créations arabes dans leur format original.', 'اكتشف الماركات الكبرى وعطور النيش والإبداعات العربية في زجاجاتها.')}</p>
    <MLink className="nocturne-cta decant-cta" href="/produits?type=bottle">{t('Explorer les parfums', 'استكشف العطور')} <ArrowRight /></MLink>
   </motion.div>
   <motion.div className="decant-editorial-visual bottle-editorial-visual" initial={reduce ? false : { opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .75, delay: .12 }}>
    <Image src="/images/full-bottles-studio-web-v3.png" alt={t('Composition studio : Creed Aventus, Baccarat Rouge 540 et Tom Ford Oud Wood', 'صورة تجمع Creed Aventus وBaccarat Rouge 540 وTom Ford Oud Wood')} fill sizes="(max-width:800px) 100vw, 64vw" />
   </motion.div>
  </motion.section>
  <motion.section id="decants" className="decant-editorial" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reduce ? 0 : .65, ease: [.22, 1, .36, 1] }}>
   <div className="decant-editorial-copy"><span className="nocturne-kicker">{t('L’ART DU DÉCANT', 'فن الأحجام الصغيرة')}</span><h2>{t('Le luxe,', 'الفخامة،')}<br /><i>{t('à votre mesure.', 'على مقاسك.')}</i></h2><p>{t('Explorez une signature avant le grand format, ou emportez votre parfum partout. Une façon plus libre de découvrir les sillages d’exception.', 'جرّب بصمة عطرية قبل الزجاجة الكبيرة، أو احمل عطرك أينما ذهبت. حرية أكبر في الاكتشاف.')}</p>
    <div className="decant-format-block"><span>{t('Choisir un format', 'اختر الحجم')}</span><div className="decant-formats" role="group" aria-label={t('Choisir le format du décant', 'اختر حجم الديكانت')}>{decantFormats.map(v => <button type="button" className={format === v ? 'active' : ''} aria-pressed={format === v} onClick={() => setFormat(v)} key={v}><span className="decant-format-value" dir="ltr"><span>{v}</span><small>ml</small></span></button>)}</div><motion.p className="decant-availability" key={format} initial={reduce ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>{count} {t('références disponibles', 'منتجات متاحة')}</motion.p></div>
    <MLink className="nocturne-cta decant-cta" href={`/produits?category=Décants&format=${format}`}>{t('Découvrir les décants', 'اكتشف الأحجام الصغيرة')} <ArrowRight /></MLink>
   </div>
   <motion.div className="decant-editorial-visual" initial={reduce ? false : { opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .75, delay: .1 }}><Image src="/images/decants-studio-demo.png" alt={t('Visuel de démonstration de trois atomiseurs', 'صورة تجريبية لثلاثة بخاخات')} fill sizes="(max-width:800px) 100vw, 55vw" /><span>{t('VISUEL DE DÉMONSTRATION', 'صورة تجريبية')}</span><div className="decant-size-markers" aria-hidden="true">{[5, 10, 20].map(v => <b key={v} className={format === v ? 'active' : ''}>{v} ml</b>)}</div></motion.div>
  </motion.section>
  <HeritageSelections /><section className="nocturne-story"><Image src="/products/catalog/amouage-interlude-cutout.png" alt="Interlude Man · Amouage" fill sizes="(max-width:700px) 100vw, 52vw" /><div className="nocturne-story-shade" /><div><span className="nocturne-kicker">{t('LE RITUEL LA7YA', 'طقوس La7ya')}</span><h2>{t('Choisir une présence,', 'اختر حضوراً،')}<br />{t('pas seulement un parfum.', 'أكثر من مجرد عطر.')}</h2><p>{t('Découvrez les formats disponibles, comparez les univers et préparez votre commande en quelques gestes.', 'اكتشف الأحجام المتاحة وقارن الخيارات وجهّز طلبك بخطوات بسيطة.')}</p><MLink href="/produits" className="nocturne-cta">{t('Commencer', 'ابدأ')} <ArrowRight /></MLink></div></section>
 </div>;
}
