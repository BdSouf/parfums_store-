import type { Product } from './data';

export type Locale = 'fr' | 'ar';
export type CartLine = { variantId: string; quantity: number; packId?: string; groupId?: string };
export type OrderLine = CartLine & { productName?: string; brand?: string; variantLabel?: string; kind?: 'bottle' | 'decant'; unitPrice?: number; image?: string };
export type Address = { id: string; label: string; city: string; address: string };
export type Customer = { id: string; name: string; email: string; phone: string; addresses: Address[]; favorites: string[]; locale: Locale };
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type HistoryEntry = { status: string; at: string };
export type Totals = { subtotal: number; discount: number; shipping: number; giftApplied: number; due: number; total: number; pointsUsed: number; eligible: number; coupon?: string; giftCode?: string };
export type DemoOrder = { reference: string; name: string; phone: string; city: string; address: string; delivery: string; total: number; status: string; createdAt: string; items: OrderLine[]; inventoryManaged?: boolean; customerId?: string; totals?: Totals; payment?: 'cod' | 'card'; paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED'; history?: HistoryEntry[]; giftWrap?: boolean; message?: string; request?: 'cancel' | 'return'; requestDecision?: string; restocked?: boolean; tracking?: string; giftPurchase?: number };
export type Promotion = { id: string; code: string; percent: number; minimum: number; start: string; end: string; active: boolean; limit: number };
export type LoyaltyEntry = { id: string; customerId: string; points: number; reason: string; order?: string; at: string };
export type GiftCard = { code: string; initial: number; balance: number; expires: string; customerId?: string; message: string; history: { reference: string; amount: number; at: string }[] };
export type Pack = { id: string; name: string; nameAr: string; variantIds: string[]; active: boolean };
export type Review = { id: string; productId: string; customerId: string; reference: string; rating: number; text: string; approved: boolean; at: string };
export type Notice = { id: string; customerId?: string; title: string; titleAr: string; body: string; bodyAr: string; at: string };
export type Subscription = { id: string; email: string; variantId?: string; notified?: boolean };
export type Content = { heroFr: string; heroAr: string; introFr: string; introAr: string; guideFr: string; guideAr: string; faqFr: string; faqAr: string; featuredIds: string[] };
export type Settings = { delivery: number; freeFrom: number; pointEarn: number; pointsBlock: number; pointsValue: number };
export type DemoState = { version: 3; products: Product[]; cart: CartLine[]; orders: DemoOrder[]; customers: Customer[]; customerId: string | null; admin: boolean; guestFavorites: string[]; comparison: string[]; promotions: Promotion[]; loyalty: LoyaltyEntry[]; giftCards: GiftCard[]; packs: Pack[]; reviews: Review[]; notices: Notice[]; subscriptions: Subscription[]; content: Content; settings: Settings };
export type CheckoutInput = Pick<DemoOrder, 'name' | 'phone' | 'city' | 'address' | 'delivery'> & { coupon?: string; usePoints?: boolean; giftCode?: string; payment?: 'cod' | 'card'; result?: 'success' | 'refused' | 'abandoned'; giftWrap?: boolean; message?: string; guest?: boolean };
export type Action =
 | { type: 'login'; email: string; password: string }
 | { type: 'register'; name: string; email: string; password: string }
 | { type: 'recover'; email: string }
 | { type: 'logout' }
 | { type: 'admin'; password?: string }
 | { type: 'profile'; customer: Customer }
 | { type: 'favorite'; id: string }
 | { type: 'compare'; id: string }
 | { type: 'cart'; id: string; quantity: number; replace?: boolean }
 | { type: 'remove'; id: string }
 | { type: 'clear' }
 | { type: 'pack'; ids: string[]; packId?: string }
 | { type: 'product'; product: Product }
 | { type: 'archive'; id: string; archived: boolean }
 | { type: 'checkout'; input: CheckoutInput }
 | { type: 'status'; reference: string; status: string }
 | { type: 'payment'; reference: string }
 | { type: 'giftExpiry'; code: string; expires: string }
 | { type: 'loyaltyAdjust'; customerId: string; points: number; reason: string }
 | { type: 'request'; reference: string; kind: 'cancel' | 'return' }
 | { type: 'decision'; reference: string; accept: boolean }
 | { type: 'restock'; reference: string }
 | { type: 'reorder'; reference: string }
 | { type: 'review'; productId: string; reference: string; rating: number; text: string }
 | { type: 'moderate'; id: string; approved: boolean }
 | { type: 'subscribe'; email: string; variantId?: string }
 | { type: 'contact'; name: string; email: string; message: string }
 | { type: 'promotion'; promotion: Promotion }
 | { type: 'savePack'; pack: Pack }
 | { type: 'settings'; settings: Settings }
 | { type: 'content'; content: Content }
 | { type: 'gift'; amount: number; message: string; result: 'success' | 'refused' | 'abandoned' };
