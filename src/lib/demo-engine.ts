import { products as original, variantVolumeMl, unitPrice, type Product } from './data';
import { productError } from './catalog';
import { descriptionsAr, noteTranslations } from './editorial';
import type { Action, CheckoutInput, DemoOrder, DemoState, Notice, Totals } from './demo-model';

export const PASSWORD = 'Demo123!';
export const STORAGE_KEY = 'la7ya-state-v3';
export const cents = (value: number) => Math.round(value * 100);
const date = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f]/g, '').toLowerCase().trim();
export const find = (state: Pick<DemoState, 'products'>, id: string) => { for (const product of state.products) { const variant = product.variants.find(v => v.id === id); if (variant) return { product, variant }; } };
export const balance = (state: DemoState, id = state.customerId) => state.loyalty.filter(e => e.customerId === id).reduce((sum, e) => sum + e.points, 0);
function assert(condition: unknown, code: string): asserts condition { if (!condition) throw new Error(code); }
const emailValid = (email: string) => /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@example\.test$/i.test(email) && email.length < 120;
const terminal = (status: string) => ['CANCELLED', 'REFUNDED'].includes(status);
const notice = (state: DemoState, title: string, titleAr: string, body: string, bodyAr: string, customerId?: string) => {
 const item: Notice = { id: uid(), title, titleAr, body, bodyAr, customerId, at: date() }; state.notices.unshift(item);
};

export function seed(): DemoState {
 const names = ['Jardin de démonstration', 'Bois de démonstration', 'Ambre de démonstration', 'Rose de démonstration', 'Brise de démonstration', 'Vanille de démonstration'];
 const ar = ['حديقة تجريبية', 'أخشاب تجريبية', 'عنبر تجريبي', 'ورد تجريبي', 'نسيم تجريبي', 'فانيليا تجريبية'];
 const notes = ['Fleur', 'Bois', 'Ambre', 'Rose', 'Agrumes', 'Vanille'];
 const notesAr = ['زهور', 'أخشاب', 'عنبر', 'ورد', 'حمضيات', 'فانيليا'];
 const extra: Product[] = names.map((name, i) => ({ id: `demo-${i}`, slug: `maison-demo-${i}`, name, nameAr: ar[i], brand: 'Maison Démo', category: ['Grandes marques', 'Parfums de niche', 'Parfums arabes'][i % 3], description: 'Référence entièrement fictive pour explorer les filtres et les formats.', descriptionAr: 'منتج خيالي بالكامل لتجربة المرشحات والأحجام.', notes: [notes[i], 'Accord démo', 'Création fictive'], notesAr: [notesAr[i], 'نفحة تجريبية', 'تركيبة خيالية'], family: ['Floral', 'Boisé', 'Ambré', 'Floral', 'Frais', 'Gourmand'][i], profile: ['mixte', 'homme', 'mixte', 'femme', 'mixte', 'femme'][i], concentration: 'EDP', publishedAt: `2026-11-${String(7 + i).padStart(2, '0')}T10:00:00Z`, image: '/images/full-bottles-studio-demo.png', images: ['/images/full-bottles-studio-demo.png', '/images/decants-studio-demo.png'], accent: '#916437', fictional: true, season: i % 2 ? 'hiver' : 'ete', variants: [{ id: `demo-${i}-b`, kind: 'bottle', label: '100 ml', volumeMl: 100, price: 250 + i * 50, stock: i === 5 ? 0 : 6, referencePrice: i === 0 ? 300 : undefined, saleStart: '2026-01-01', saleEnd: '2030-12-31' }, ...[2, 5, 10, 20].map(v => ({ id: `demo-${i}-d${v}`, kind: 'decant' as const, label: `${v} ml`, volumeMl: v, price: v * (i + 3), stock: i === 5 ? 0 : 12 }))] }));
 const products = [...original.map((p, i) => ({ ...structuredClone(p), descriptionAr: descriptionsAr[p.id], notesAr: p.notes.map(n => noteTranslations[n] || n), publishedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00Z`, variants: p.variants.map(v => ({ ...v, volumeMl: variantVolumeMl(v) ?? undefined })) })), ...extra];
 const at = '2026-11-01T10:00:00Z';
 return { version: 3, products, cart: [], orders: [{ reference: 'DEMO-EXEMPLE', name: 'Client Démo', phone: '0600000000', city: 'Rabat', address: 'Adresse fictive de démonstration', delivery: 'Livraison à domicile', total: 280, status: 'DELIVERED', createdAt: at, customerId: 'client-demo', inventoryManaged: false, items: [{ variantId: 'demo-0-b', quantity: 1, productName: names[0], brand: 'Maison Démo', variantLabel: '100 ml', kind: 'bottle', unitPrice: 250, image: extra[0].image }], payment: 'cod', paymentStatus: 'PAID', history: [{ status: 'DELIVERED', at }] }], customers: [{ id: 'client-demo', name: 'Client Démo', email: 'client@example.test', phone: '0600000000', addresses: [{ id: 'adresse-demo', label: 'Démo', city: 'Rabat', address: 'Adresse fictive de démonstration' }], favorites: [], locale: 'fr' }], customerId: null, admin: false, guestFavorites: [], comparison: [], promotions: [{ id: 'demo10', code: 'DEMO10', percent: 10, minimum: 0, start: '2026-01-01', end: '2030-12-31', active: true, limit: 1 }], loyalty: [{ id: 'welcome-demo', customerId: 'client-demo', points: 150, reason: 'Solde fictif initial / رصيد تجريبي', at }], giftCards: [{ code: 'DEMO-CADEAU', initial: 200, balance: 200, expires: '2030-12-31', message: 'Carte fictive / بطاقة تجريبية', history: [] }], packs: [{ id: 'pack-decouverte', name: 'Trio découverte démo', nameAr: 'ثلاثي الاكتشاف التجريبي', variantIds: ['demo-0-d5', 'demo-1-d5', 'demo-2-d5'], active: true }], reviews: [], notices: [], subscriptions: [], settings: { delivery: 30, freeFrom: 600, pointEarn: 10, pointsBlock: 100, pointsValue: 10 }, content: { heroFr: 'L’élégance laisse une trace.', heroAr: 'الأناقة تترك أثراً.', introFr: 'Flacons et décants. Explorez votre prochaine signature.', introAr: 'زجاجات وأحجام صغيرة. اكتشف عطرك القادم.', guideFr: 'Un décant est une portion transférée du flacon dans un atomiseur. Le visuel du flacon ne représente pas nécessairement le contenant livré. Les références Maison Démo sont fictives.', guideAr: 'الديكانت كمية تُنقل من الزجاجة إلى بخاخ صغير. صورة الزجاجة لا تمثل دائماً العبوة المستلمة. منتجات Maison Démo خيالية.', faqFr: 'Cette boutique est une démonstration locale. Les prix, stocks, frais et commandes sont fictifs. Aucun paiement ou message réel.', faqAr: 'هذا المتجر عرض محلي تجريبي. الأسعار والمخزون والرسوم والطلبات افتراضية. لا يوجد دفع أو إرسال حقيقي.', featuredIds: ['p5', 'p9', 'demo-0'] } };
}

export function migrate(raw: unknown): DemoState {
 assert(raw && typeof raw === 'object', 'invalidData');
 const v = raw as Partial<DemoState>;
 assert(Array.isArray(v.products) && Array.isArray(v.cart) && Array.isArray(v.orders), 'invalidData');
 if (v.version !== undefined) assert(v.version === 3, 'invalidData');
 const next = v.version === 3 ? structuredClone(v) as DemoState : { ...seed(), products: v.products, cart: v.cart, orders: v.orders };
 next.products = next.products.map(p => ({ ...p, descriptionAr:p.descriptionAr || (original.some(x=>x.id===p.id&&x.description===p.description)?descriptionsAr[p.id]:undefined), notesAr:p.notesAr || (p.notes.every(n=>noteTranslations[n]) ? p.notes.map(n=>noteTranslations[n]) : undefined), variants: p.variants.map(x => ({ ...x, volumeMl: x.volumeMl ?? variantVolumeMl(x) ?? undefined })) }));
 next.orders = next.orders.map(o => ({ ...o, items: o.items.map(l => { const x = find(next,l.variantId); return x ? {productName:x.product.name,brand:x.product.brand,variantLabel:x.variant.label,kind:x.variant.kind,unitPrice:unitPrice(x.variant),image:x.product.image,...l} : l; }) }));
 validate(next);
 return next;
}
export function validate(s: DemoState) {
 assert(s.version === 3 && Array.isArray(s.products) && s.products.length <= 500 && s.products.every(p => !productError(p)), 'invalidData');
 const unique = (ids: string[]) => ids.every(x => typeof x === 'string' && x.length > 0) && new Set(ids).size === ids.length;
 assert(unique(s.products.map(p => p.id)) && unique(s.products.map(p => p.slug)) && unique(s.products.flatMap(p => p.variants.map(v => v.id))), 'invalidData');
 for (const k of ['cart', 'orders', 'customers', 'guestFavorites', 'comparison', 'promotions', 'loyalty', 'giftCards', 'packs', 'reviews', 'notices', 'subscriptions'] as const) assert(Array.isArray(s[k]), 'invalidData');
 assert(s.cart.every(l => typeof l.variantId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= 100000) && unique(s.cart.map(l => l.variantId)), 'invalidData');
 assert(unique(s.customers.map(c => c.id)) && unique(s.customers.map(c => c.email)) && s.customers.every(c => emailValid(c.email) && typeof c.name === 'string' && typeof c.phone === 'string' && ['fr', 'ar'].includes(c.locale) && Array.isArray(c.addresses) && c.addresses.every(a => [a.id, a.label, a.city, a.address].every(v => typeof v === 'string')) && Array.isArray(c.favorites) && c.favorites.every(x => typeof x === 'string')), 'invalidData');
 assert((s.customerId === null || s.customers.some(c => c.id === s.customerId)) && typeof s.admin === 'boolean' && s.comparison.length <= 3 && s.comparison.every(x => typeof x === 'string') && s.guestFavorites.every(x => typeof x === 'string'), 'invalidData');
 assert(unique(s.orders.map(o => o.reference)) && s.orders.every(o => [o.reference, o.name, o.phone, o.city, o.address, o.delivery, o.status, o.createdAt].every(x => typeof x === 'string') && Number.isFinite(o.total) && o.total >= 0 && Array.isArray(o.items) && o.items.every(l => typeof l.variantId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0 && (l.unitPrice === undefined || Number.isFinite(l.unitPrice) && l.unitPrice >= 0)) && (!o.totals || Object.entries(o.totals).every(([k, v]) => ['coupon', 'giftCode'].includes(k) ? v === undefined || typeof v === 'string' : Number.isFinite(v) && Number(v) >= 0)) && (!o.history || Array.isArray(o.history) && o.history.every(h => typeof h.at === 'string' && typeof h.status === 'string'))), 'invalidData');
 assert(s.settings && ['delivery','freeFrom','pointEarn','pointsBlock','pointsValue'].every(k => Number.isFinite(s.settings[k as keyof typeof s.settings]) && s.settings[k as keyof typeof s.settings] >= 0) && s.settings.pointEarn > 0 && Number.isInteger(s.settings.pointsBlock) && s.settings.pointsBlock > 0 && s.settings.pointsValue > 0, 'invalidData');
 assert(s.content && ['heroFr', 'heroAr', 'introFr', 'introAr', 'guideFr', 'guideAr', 'faqFr', 'faqAr'].every(k => typeof s.content[k as keyof typeof s.content] === 'string') && Array.isArray(s.content.featuredIds), 'invalidData');
 assert(unique(s.promotions.map(p => p.code)) && s.promotions.every(p => typeof p.id === 'string' && /^[A-Z0-9-]{2,30}$/.test(p.code) && Number.isFinite(p.percent) && p.percent > 0 && p.percent <= 100 && Number.isFinite(p.minimum) && p.minimum >= 0 && Number.isInteger(p.limit) && p.limit >= 1 && typeof p.active === 'boolean' && Number.isFinite(Date.parse(p.start)) && Number.isFinite(Date.parse(p.end)) && p.start <= p.end), 'invalidData');
 assert(unique(s.giftCards.map(g => g.code)) && s.giftCards.every(g => typeof g.code === 'string' && Number.isFinite(g.initial) && Number.isFinite(g.balance) && g.initial > 0 && g.balance >= 0 && g.balance <= g.initial && Number.isFinite(Date.parse(g.expires)) && typeof g.message === 'string' && Array.isArray(g.history) && g.history.every(h => typeof h.reference === 'string' && Number.isFinite(h.amount) && typeof h.at === 'string')), 'invalidData');
 assert(s.loyalty.every(l => typeof l.id === 'string' && typeof l.customerId === 'string' && Number.isInteger(l.points) && typeof l.reason === 'string' && typeof l.at === 'string'), 'invalidData');
 assert(s.packs.every(p => typeof p.id === 'string' && typeof p.name === 'string' && typeof p.nameAr === 'string' && typeof p.active === 'boolean' && Array.isArray(p.variantIds) && p.variantIds.length === 3 && p.variantIds.every(id => typeof id === 'string')), 'invalidData');
 assert(s.reviews.every(r => typeof r.id === 'string' && typeof r.productId === 'string' && typeof r.customerId === 'string' && typeof r.reference === 'string' && typeof r.text === 'string' && r.text.length <= 1000 && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 && typeof r.approved === 'boolean'), 'invalidData');
 assert(s.notices.every(n => [n.id, n.title, n.titleAr, n.body, n.bodyAr, n.at].every(v => typeof v === 'string')) && s.subscriptions.every(s => typeof s.id === 'string' && emailValid(s.email) && (s.variantId === undefined || typeof s.variantId === 'string')), 'invalidData');
 assert(s.orders.every(o=>Number.isFinite(Date.parse(o.createdAt))&&(!o.history||o.history.every(h=>Number.isFinite(Date.parse(h.at))))&&(!o.totals||(['subtotal','eligible','discount','shipping','total','giftApplied','due','pointsUsed'] as const).every(k=>Number.isFinite(o.totals![k])&&o.totals![k]>=0))), 'invalidData');
 assert(s.orders.every(o=>!o.totals||(o.totals.eligible<=o.totals.subtotal&&o.totals.discount<=o.totals.subtotal&&o.totals.giftApplied<=o.totals.total&&Number.isInteger(o.totals.pointsUsed)&&cents(o.totals.total)===cents(o.totals.subtotal)-cents(o.totals.discount)+cents(o.totals.shipping)&&cents(o.totals.due)===cents(o.totals.total)-cents(o.totals.giftApplied))), 'invalidData');
 assert(s.notices.every(n=>Number.isFinite(Date.parse(n.at)))&&s.loyalty.every(l=>Number.isFinite(Date.parse(l.at))), 'invalidData');
}

export function quote(s: DemoState, input: Pick<CheckoutInput, 'delivery' | 'coupon' | 'usePoints' | 'giftCode' | 'guest'>): Totals {
 let subtotal = 0, eligible = 0;
 for (const line of s.cart) { const x = find(s, line.variantId); assert(x && !x.product.archived && line.quantity <= x.variant.stock, 'stock'); const amount = cents(unitPrice(x.variant)) * line.quantity; subtotal += amount; if (!line.packId) eligible += amount; }
 let discount = 0, pointsUsed = 0;
 const customerId = input.guest ? null : s.customerId;
 assert(!(input.coupon && input.usePoints), 'noStack');
 if (input.coupon) {
  assert(customerId, 'loginRequired');
  const p = s.promotions.find(p => p.code === input.coupon?.trim().toUpperCase());
  const day = date().slice(0, 10);
  assert(p && p.active && day >= p.start.slice(0, 10) && day <= p.end.slice(0, 10) && subtotal >= cents(p.minimum) && eligible > 0, 'coupon');
  assert(s.orders.filter(o => o.customerId === customerId && !terminal(o.status) && o.totals?.coupon === p.code).length < p.limit, 'couponUsed');
  discount = Math.round(eligible * p.percent / 100);
 }
 if (input.usePoints) {
  assert(customerId, 'loginRequired');
  const blocks = Math.min(Math.floor(balance(s, customerId) / s.settings.pointsBlock), Math.floor(subtotal / cents(s.settings.pointsValue)));
  assert(blocks > 0, 'points'); pointsUsed = blocks * s.settings.pointsBlock; discount = blocks * cents(s.settings.pointsValue);
 }
 const shipping = input.delivery === 'Retrait en boutique' || subtotal - discount >= cents(s.settings.freeFrom) ? 0 : cents(s.settings.delivery);
 const total = subtotal - discount + shipping;
 let giftApplied = 0;
 if (input.giftCode) { const gift = s.giftCards.find(g => g.code === input.giftCode?.trim().toUpperCase()); assert(gift && Date.parse(gift.expires) >= Date.now() && gift.balance > 0, 'gift'); giftApplied = Math.min(cents(gift.balance), total); }
 return { subtotal: subtotal / 100, eligible: eligible / 100, discount: discount / 100, shipping: shipping / 100, total: total / 100, giftApplied: giftApplied / 100, due: (total - giftApplied) / 100, pointsUsed, coupon: input.coupon?.trim().toUpperCase() || undefined, giftCode: input.giftCode?.trim().toUpperCase() || undefined };
}

function adjustStock(s: DemoState, order: DemoOrder, direction: number) {
 for (const line of order.items) { const x = find(s, line.variantId); assert(x && (direction > 0 || !x.product.archived && x.variant.stock >= line.quantity), 'stock'); x.variant.stock += direction * line.quantity; }
}
function credit(s: DemoState, o: DemoOrder, points: number, reason: string) { if (o.customerId && points) s.loyalty.push({ id: uid(), customerId: o.customerId, order: o.reference, points, reason, at: date() }); }
function unwind(s: DemoState, o: DemoOrder) {
 const net = s.loyalty.filter(l => l.order === o.reference).reduce((sum, l) => sum + l.points, 0);
 credit(s, o, -net, 'Annulation / إلغاء');
 if (o.totals?.giftCode && o.totals.giftApplied) { const g = s.giftCards.find(g => g.code === o.totals?.giftCode); assert(g, 'gift'); g.balance = (cents(g.balance) + cents(o.totals.giftApplied)) / 100; g.history.push({ reference: o.reference, amount: o.totals.giftApplied, at: date() }); }
 if (o.giftPurchase) { const g = s.giftCards.find(g => g.history.some(h => h.reference === o.reference && h.amount === g.initial)); assert(g && g.balance === g.initial, 'giftSpent'); g.balance = 0; }
 if (o.paymentStatus === 'PAID') o.paymentStatus = 'REFUNDED';
}
function reserveBenefits(s: DemoState, o: DemoOrder) {
 if (!o.totals) return;
 if(o.totals.pointsUsed) assert(o.customerId && balance(s, o.customerId) >= o.totals.pointsUsed, 'points');
 if(o.totals.coupon) {const p=s.promotions.find(p=>p.code===o.totals?.coupon);assert(p&&s.orders.filter(x=>x.reference!==o.reference&&x.customerId===o.customerId&&!terminal(x.status)&&x.totals?.coupon===p.code).length<p.limit,'couponUsed');}
 credit(s, o, -o.totals.pointsUsed, 'Utilisation / استخدام');
 if (o.totals.giftApplied) { const g = s.giftCards.find(g => g.code === o.totals?.giftCode); assert(g && Date.parse(g.expires) >= Date.now() && cents(g.balance) >= cents(o.totals.giftApplied), 'gift'); g.balance = (cents(g.balance) - cents(o.totals.giftApplied)) / 100; g.history.push({ reference: o.reference, amount: -o.totals.giftApplied, at: date() }); }
}

export function transition(current: DemoState, action: Action): { state: DemoState; reference?: string } {
 action = structuredClone(action);
 const s = structuredClone(current), at = date();
 const adminActions = ['product', 'archive', 'status', 'payment', 'giftExpiry', 'loyaltyAdjust', 'decision', 'restock', 'moderate', 'promotion', 'savePack', 'settings', 'content'];
 if (adminActions.includes(action.type)) assert(s.admin, 'adminRequired');
 switch (action.type) {
 case 'login': { const c = s.customers.find(c => c.email === action.email.toLowerCase().trim()); assert(c && action.password === PASSWORD, 'credentials'); s.customerId = c.id; break; }
 case 'register': { const email = action.email.toLowerCase().trim(); assert(emailValid(email) && action.name.trim().length >= 2 && action.password === PASSWORD, 'testAccount'); assert(!s.customers.some(c => c.email === email), 'exists'); const id = uid(); s.customers.push({ id, name: action.name.trim(), email, phone: '0600000000', addresses: [], favorites: [], locale: 'fr' }); s.customerId = id; notice(s, 'Bienvenue — démo', 'مرحباً — عرض تجريبي', 'Compte fictif créé. Aucun email envoyé.', 'تم إنشاء حساب تجريبي. لم يُرسل بريد.', id); break; }
 case 'recover': assert(emailValid(action.email), 'testAccount'); notice(s, 'Récupération simulée', 'استعادة تجريبية', `Accès de test : ${PASSWORD}. Aucun email envoyé.`, `كلمة المرور التجريبية: ${PASSWORD}. لم يُرسل بريد.`, s.customers.find(c => c.email === action.email.trim().toLowerCase())?.id); break;
 case 'logout': s.customerId = null; break;
 case 'admin': if (action.password === undefined) s.admin = false; else { assert(action.password === PASSWORD, 'credentials'); s.admin = true; } break;
 case 'profile': { assert(s.customerId === action.customer.id, 'loginRequired'); assert(emailValid(action.customer.email) && action.customer.name.trim().length >= 2 && !s.customers.some(c => c.id !== action.customer.id && c.email === action.customer.email), 'testAccount'); s.customers = s.customers.map(c => c.id === action.customer.id ? action.customer : c); break; }
 case 'favorite': { assert(s.products.some(p => p.id === action.id), 'missing'); const c = s.customers.find(c => c.id === s.customerId); const list = c ? c.favorites : s.guestFavorites; const next = list.includes(action.id) ? list.filter(id => id !== action.id) : [...list, action.id]; if (c) c.favorites = next; else s.guestFavorites = next; break; }
 case 'compare': { const list = s.comparison; assert(list.includes(action.id) || list.length < 3, 'compareLimit'); assert(s.products.some(p => p.id === action.id), 'missing'); s.comparison = list.includes(action.id) ? list.filter(id => id !== action.id) : [...list, action.id]; break; }
 case 'cart': { const x = find(s, action.id); assert(x && !x.product.archived && Number.isInteger(action.quantity) && action.quantity > 0, 'stock'); const line = s.cart.find(l => l.variantId === action.id); assert(!line?.groupId, 'packConflict'); const qty = action.replace ? action.quantity : (line?.quantity || 0) + action.quantity; assert(qty <= x.variant.stock, 'stock'); if (line) line.quantity = qty; else s.cart.push({ variantId: action.id, quantity: qty }); break; }
 case 'remove': { const line = s.cart.find(l => l.variantId === action.id); s.cart = s.cart.filter(l => line?.groupId ? l.groupId !== line.groupId : l.variantId !== action.id); break; }
 case 'clear': s.cart = []; break;
 case 'pack': { const pack = action.packId ? s.packs.find(p => p.id === action.packId && p.active) : undefined; assert(!action.packId || pack, 'missing'); const ids = pack?.variantIds || action.ids; assert(ids.length === 3 && ids.every(id => { const x = find(s, id); return x && !x.product.archived && x.variant.kind === 'decant' && variantVolumeMl(x.variant) === 5; }), 'pack'); assert(ids.every(id => !s.cart.some(l => l.variantId === id)), 'packConflict'); const groupId = uid(); for (const id of new Set(ids)) { const qty = ids.filter(x => x === id).length; assert(find(s, id)!.variant.stock >= qty, 'stock'); s.cart.push({ variantId: id, quantity: qty, packId: pack?.id || 'custom', groupId }); } break; }
 case 'checkout': {
  const input = action.input;
  assert(s.cart.length > 0, 'empty'); assert(input.name.trim().length >= 2 && /^(\+212|0)[5-7]\d{8}$/.test(input.phone) && input.city.trim().length >= 2 && input.address.trim().length >= 5 && ['Livraison à domicile', 'Retrait en boutique'].includes(input.delivery), 'coordinates');
  const totals = quote(s, input); assert(input.result !== 'refused', 'paymentRefused'); assert(input.result !== 'abandoned', 'paymentAbandoned');
  const reference = `DEMO-${uid().slice(0, 8).toUpperCase()}`;
  const order: DemoOrder = { reference, name: input.name.trim(), phone: input.phone, city: input.city.trim(), address: input.address.trim(), delivery: input.delivery, total: totals.total, totals, items: s.cart.map(l => { const x = find(s, l.variantId)!; return { ...l, productName: x.product.name, brand: x.product.brand, variantLabel: x.variant.label, kind: x.variant.kind, unitPrice: unitPrice(x.variant), image: x.product.image }; }), status: 'PENDING', createdAt: at, inventoryManaged: true, customerId: input.guest ? undefined : s.customerId || undefined, payment: input.payment || 'cod', paymentStatus: input.payment === 'card' || totals.due === 0 ? 'PAID' : 'PENDING', giftWrap: input.giftWrap, message: input.message?.slice(0, 500), history: [{ status: 'PENDING', at }] };
  adjustStock(s, order, -1); reserveBenefits(s, order); s.orders.unshift(order); s.cart = []; notice(s, 'Commande enregistrée', 'تم تسجيل الطلب', reference, reference, order.customerId); validate(s); return { state: s, reference };
 }
 case 'status': {
  const o = s.orders.find(o => o.reference === action.reference); assert(o && ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(action.status), 'status'); if (o.status === action.status) break;
  assert(o.status !== 'REFUNDED' && !(o.status === 'DELIVERED' && action.status !== 'REFUNDED'), 'status');
  if (action.status === 'REFUNDED') assert(o.status === 'DELIVERED', 'status');
  if (terminal(action.status) && !terminal(o.status)) { if (action.status === 'CANCELLED') { assert(!['SHIPPED', 'DELIVERED'].includes(o.status), 'status'); if (o.inventoryManaged) adjustStock(s, o, 1); } unwind(s, o); }
  if (o.status === 'CANCELLED' && !terminal(action.status)) { assert(action.status === 'PENDING' && !o.giftPurchase, 'status'); if (o.inventoryManaged) adjustStock(s, o, -1); reserveBenefits(s, o); o.paymentStatus = o.payment === 'card' || o.totals?.due === 0 ? 'PAID' : 'PENDING'; }
  if (!terminal(o.status) && !terminal(action.status)) { const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']; assert(steps.indexOf(action.status) > steps.indexOf(o.status), 'status'); }
  o.status = action.status; (o.history ||= []).push({ status: action.status, at });
  if (o.status === 'SHIPPED') o.tracking = `SUIVI-${o.reference}`;
  if (o.status === 'DELIVERED') { if (!s.loyalty.some(l => l.order === o.reference && l.reason === 'Achat / شراء')) { const eligible = o.totals ? Math.max(0, cents(o.totals.subtotal) - cents(o.totals.discount)) / 100 : o.total; credit(s, o, Math.floor(eligible / s.settings.pointEarn), 'Achat / شراء'); } }
  notice(s, 'Statut de commande', 'حالة الطلب', `${o.reference} · ${o.status}`, `${o.reference} · ${o.status}`, o.customerId); break;
 }
 case 'request': { const o = s.orders.find(o => o.reference === action.reference); assert(o && (o.customerId ? o.customerId === s.customerId : !s.customerId) && !o.request, 'request'); assert(action.kind === 'cancel' ? ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status) : o.status === 'DELIVERED', 'request'); o.request = action.kind; o.requestDecision = undefined; break; }
 case 'payment': { const o = s.orders.find(o => o.reference === action.reference); assert(o && !terminal(o.status) && o.paymentStatus === 'PENDING', 'status'); o.paymentStatus = 'PAID'; (o.history ||= []).push({ status: 'PAID', at }); break; }
 case 'giftExpiry': { const g = s.giftCards.find(g => g.code === action.code); assert(g && Number.isFinite(Date.parse(action.expires)), 'gift'); g.expires = action.expires; break; }
 case 'loyaltyAdjust': assert(s.customers.some(c => c.id === action.customerId) && Number.isInteger(action.points) && Math.abs(action.points) <= 100000 && balance(s, action.customerId) + action.points >= 0 && action.reason.trim().length >= 3, 'points'); s.loyalty.push({ id: uid(), customerId: action.customerId, points: action.points, reason: action.reason.slice(0, 200), at }); break;
 case 'decision': { const o = s.orders.find(o => o.reference === action.reference); assert(o?.request && !o.requestDecision, 'request'); if (action.accept) { const result = transition(s, { type: 'status', reference: o.reference, status: o.request === 'cancel' ? 'CANCELLED' : 'REFUNDED' }); const updated = result.state.orders.find(x => x.reference === o.reference)!; updated.requestDecision = 'accepted'; return result; } o.requestDecision = 'refused'; notice(s, 'Demande examinée', 'تمت مراجعة الطلب', `${o.reference} : demande refusée (simulation).`, `${o.reference}: رُفض الطلب (محاكاة).`, o.customerId); break; }
 case 'restock': { const o = s.orders.find(o => o.reference === action.reference); assert(o && o.status === 'REFUNDED' && !o.restocked && !o.giftPurchase, 'status'); adjustStock(s, o, 1); o.restocked = true; break; }
 case 'reorder': { const o = s.orders.find(o => o.reference === action.reference); assert(o && (s.admin || o.customerId ? s.admin || o.customerId === s.customerId : !s.customerId) && !o.giftPurchase, 'missing'); const result = new Map(s.cart.map(l => [l.variantId, { ...l }])); for (const line of o.items) { const x = find(s, line.variantId); assert(x && !x.product.archived, 'stock'); const qty = (result.get(line.variantId)?.quantity || 0) + line.quantity; assert(qty <= x.variant.stock, 'stock'); result.set(line.variantId, { variantId: line.variantId, quantity: qty }); } s.cart = [...result.values()]; break; }
 case 'product': { const p = action.product; assert(!productError(p), 'product'); assert(!s.products.some(x => x.id !== p.id && (x.slug === p.slug || x.variants.some(v => p.variants.some(z => z.id === v.id)))), 'product'); const old = s.products.find(x => x.id === p.id); assert(!old || old.slug === p.slug, 'product'); if (old) for (const v of old.variants) { const next = p.variants.find(x => x.id === v.id); assert(!s.orders.some(o => o.inventoryManaged && !terminal(o.status) && o.items.some(l => l.variantId === v.id)) || next && next.kind === v.kind && variantVolumeMl(next) === variantVolumeMl(v), 'reserved'); }
  s.products = old ? s.products.map(x => x.id === p.id ? p : x) : [p, ...s.products];
  for (const sub of s.subscriptions.filter(x => x.variantId && !x.notified)) { const x = find(s, sub.variantId!); if (x && !x.product.archived && x.variant.stock > 0) { notice(s, 'Retour en stock simulé', 'عودة تجريبية للمخزون', `${x.product.name} · ${sub.email}`, `${x.product.nameAr || x.product.name} · ${sub.email}`, s.customers.find(c => c.email === sub.email)?.id); sub.notified = true; } } break;
 }
 case 'archive': { const p = s.products.find(p => p.id === action.id); assert(p, 'missing'); p.archived = action.archived; break; }
 case 'review': { const o = s.orders.find(o => o.reference === action.reference); assert(s.customerId && o?.customerId === s.customerId && o.status === 'DELIVERED' && o.items.some(l => find(s, l.variantId)?.product.id === action.productId), 'review'); assert(Number.isInteger(action.rating) && action.rating >= 1 && action.rating <= 5 && action.text.trim().length >= 5 && action.text.length <= 1000 && !s.reviews.some(r => r.customerId === s.customerId && r.productId === action.productId && r.reference === o.reference), 'review'); s.reviews.unshift({ id: uid(), customerId: s.customerId, productId: action.productId, reference: o.reference, rating: action.rating, text: action.text.trim(), approved: false, at }); break; }
 case 'moderate': { const r = s.reviews.find(r => r.id === action.id); assert(r, 'missing'); r.approved = action.approved; break; }
 case 'subscribe': assert(emailValid(action.email), 'testAccount'); if (action.variantId) assert(find(s, action.variantId), 'missing'); assert(!s.subscriptions.some(x => x.email === action.email && x.variantId === action.variantId), 'exists'); s.subscriptions.push({ id: uid(), email: action.email, variantId: action.variantId }); notice(s, 'Inscription locale', 'اشتراك محلي', `${action.email} · aucun envoi réel.`, `${action.email} · دون إرسال حقيقي.`, s.customers.find(c => c.email === action.email)?.id); break;
 case 'contact': assert(emailValid(action.email) && action.name.trim().length >= 2 && action.message.trim().length >= 5 && action.message.length <= 1000, 'testAccount'); notice(s, 'Contact — aperçu local', 'تواصل — معاينة محلية', `${action.name} · ${action.email} : ${action.message}`, `${action.name} · ${action.email} : ${action.message}`, s.customerId || undefined); break;
 case 'promotion': s.promotions = [...s.promotions.filter(p => p.id !== action.promotion.id), action.promotion]; break;
 case 'savePack': assert(action.pack.variantIds.every(id => { const x = find(s, id); return x?.variant.kind === 'decant' && variantVolumeMl(x.variant) === 5; }), 'pack'); s.packs = [...s.packs.filter(p => p.id !== action.pack.id), action.pack]; break;
 case 'settings': s.settings = action.settings; break;
 case 'content': s.content = action.content; break;
 case 'gift': {
  assert(s.customerId && [200, 500, 1000].includes(action.amount), 'loginRequired'); assert(action.result !== 'refused', 'paymentRefused'); assert(action.result !== 'abandoned', 'paymentAbandoned');
  const reference = `DEMO-${uid().slice(0, 8).toUpperCase()}`, code = `CADEAU-${uid().slice(0, 8).toUpperCase()}`; const expiration = new Date(at); expiration.setUTCFullYear(expiration.getUTCFullYear() + 1);
  s.giftCards.unshift({ code, initial: action.amount, balance: action.amount, expires: expiration.toISOString(), customerId: s.customerId, message: action.message.slice(0, 500), history: [{ reference, amount: action.amount, at }] });
  const c = s.customers.find(c => c.id === s.customerId)!;
  s.orders.unshift({ reference, name: c.name, phone: c.phone, city: 'Digital', address: 'Carte cadeau virtuelle / بطاقة افتراضية', delivery: 'Digital', total: action.amount, status: 'DELIVERED', createdAt: at, customerId: c.id, items: [], giftPurchase: action.amount, payment: 'card', paymentStatus: 'PAID', history: [{ status: 'DELIVERED', at }] });
  notice(s, 'Carte cadeau émise — démo', 'إصدار بطاقة هدية تجريبية', code, code, c.id); validate(s); return { state: s, reference };
 }
 }
 validate(s); return { state: s };
}
