"use client";
import { MLink, useMarket } from './market-context';
export function UnavailableView(){const {t}=useMarket();return <div className="m-wrap m-empty"><span className="m-kicker">LA7YA</span><h1>{t('Cette page n’est pas disponible.','هذه الصفحة غير متاحة.')}</h1><p>{t('Le produit est archivé ou la page n’existe pas dans cette démonstration.','المنتج مؤرشف أو الصفحة غير موجودة في هذا العرض.')}</p><MLink className="m-button" href="/produits">{t('Retour à la collection','العودة للمجموعة')}</MLink></div>;}
