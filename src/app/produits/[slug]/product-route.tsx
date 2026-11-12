"use client";
import { useStore } from '@/lib/store';
import { useMarket } from '@/components/market-context';
import { UnavailableView } from '@/components/market-unavailable';
import { ProductDetail } from './product-detail';
export function ProductRoute({slug}:{slug:string}){const {products,ready}=useStore();const {t}=useMarket();const p=products.find(p=>p.slug===slug&&!p.archived);if(!ready)return <p role="status">{t('Chargement…','جارٍ التحميل…')}</p>;return p?<ProductDetail key={p.id} product={p}/>:<UnavailableView/>;}
