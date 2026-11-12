import { variantVolumeMl, unitPrice, type Product, type Variant } from './data';
import { normalize } from './demo-engine';
import type { DemoState } from './demo-model';
export function onSale(v: Variant, now = new Date().toISOString().slice(0, 10)) { return !!v.referencePrice && v.referencePrice > v.price && !!v.saleStart && !!v.saleEnd && now >= v.saleStart.slice(0, 10) && now <= v.saleEnd.slice(0, 10); }
export function catalogQuery(s: DemoState, params: URLSearchParams) {
 const q = normalize(params.get('q') || ''), get = (k: string) => params.get(k) || '';
 const sold = (p: Product) => s.orders.filter(o => o.status === 'DELIVERED').flatMap(o => o.items).filter(l => p.variants.some(v => v.id === l.variantId)).reduce((n, l) => n + l.quantity, 0);
 const rows = s.products.flatMap(product => {
  if (product.archived || get('brand') && product.brand !== get('brand') || ['profile', 'family', 'concentration', 'season'].some(k => get(k) && product[k as keyof Product] !== get(k))) return [];
  if (get('category') && !['Tous', 'Décants'].includes(get('category')) && product.category !== get('category')) return [];
  const text = normalize([product.name, product.nameAr, product.brand, product.description, product.descriptionAr, ...product.notes, ...(product.notesAr || [])].join(' '));
  if (q && !text.includes(q) || get('note') && !product.notes.includes(get('note')) && !product.notesAr?.includes(get('note'))) return [];
  const variants = product.variants.filter(v => (!get('type') || v.kind === get('type')) && (get('category') !== 'Décants' || v.kind === 'decant') && (!get('format') || v.kind === 'decant' && variantVolumeMl(v) === Number(get('format'))) && (!get('min') || unitPrice(v) >= Number(get('min'))) && (!get('max') || unitPrice(v) <= Number(get('max'))) && (get('stock') !== '1' || v.stock > 0) && (get('promo') !== '1' || onSale(v)));
  if (!variants.length) return [];
  const variant = [...variants].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || unitPrice(a) - unitPrice(b))[0];
  return [{ product, variant }];
 }).sort((a, b) => get('sort') === 'low' ? unitPrice(a.variant) - unitPrice(b.variant) : get('sort') === 'high' ? unitPrice(b.variant) - unitPrice(a.variant) : get('sort') === 'best' ? sold(b.product) - sold(a.product) : (Date.parse(b.product.publishedAt || '') || 0) - (Date.parse(a.product.publishedAt || '') || 0) || a.product.id.localeCompare(b.product.id));
 const pages = Math.max(1, Math.ceil(rows.length / 12));
 const page = Math.min(pages, Math.max(1, Math.floor(Number(get('page')) || 1)));
 return { rows, visible: rows.slice((page - 1) * 12, page * 12), pages, page };
}
