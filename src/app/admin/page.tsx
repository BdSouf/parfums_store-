"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Boxes, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, PackageCheck, Search, ShoppingBag, Plus, Pencil } from "lucide-react";
import { categories, money, type Product } from "@/lib/data";
import { useStore, type DemoOrder } from "@/lib/store";
import styles from "./admin.module.css";
import { ProductEditor } from "./product-editor";
import { ThemeToggle } from "@/components/layout";

type View = "overview" | "orders" | "catalog";
const labels: Record<string, string> = { PENDING: "En attente", CONFIRMED: "Confirmée", PREPARING: "Préparation", SHIPPED: "Expédiée", DELIVERED: "Livrée", CANCELLED: "Annulée" };
const titles: Record<View, { title: string; description: string }> = {
  overview: { title: "Vue d’ensemble.", description: "L’essentiel de votre boutique, en un regard." },
  orders: { title: "Vos commandes.", description: "Retrouvez une commande et faites évoluer son statut." },
  catalog: { title: "Le catalogue.", description: "Ajoutez vos parfums et gérez leurs formats, prix et stocks." },
};
const pageSize = 15;
const timestamp = (value: string) => new Date(value).getTime() || 0;
function orderDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date indisponible" : new Intl.DateTimeFormat("fr-MA", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Casablanca" }).format(date);
}

export default function Admin() {
  const { orders, products, setStatus, setArchived, ready } = useStore();
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [archiveFilter, setArchiveFilter] = useState("active");
  const activeProducts = products.filter(product => !product.archived);
  const [view, setView] = useState<View>("overview");
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState("ALL");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState("");
  const pending = orders.filter(order => order.status === "PENDING").length;
  const active = orders.filter(order => ["CONFIRMED", "PREPARING", "SHIPPED"].includes(order.status)).length;
  const delivered = orders.filter(order => order.status === "DELIVERED");
  const deliveredTotal = delivered.reduce((sum, order) => sum + order.total, 0);
  const sorted = [...orders].sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
  const filtered = sorted.filter(order => (status === "ALL" || order.status === status) && `${order.reference} ${order.name} ${order.phone} ${order.city}`.toLocaleLowerCase("fr").includes(query.trim().toLocaleLowerCase("fr")));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = view === "overview" ? sorted.slice(0, 5) : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const catalog = products.filter(product => (archiveFilter === "all" || (archiveFilter === "archived" ? product.archived : !product.archived)) && `${product.name} ${product.brand}`.toLocaleLowerCase("fr").includes(catalogQuery.trim().toLocaleLowerCase("fr")) && (category === "Tous" || (category === "Décants" ? product.variants.some(variant => variant.kind === "decant") : product.category === category)));
  const variantCount = activeProducts.reduce((sum, product) => sum + product.variants.length, 0);
  const lowStock = activeProducts.flatMap(product => product.variants).filter(variant => variant.stock > 0 && variant.stock <= 3).length;
  const date = ready ? new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Casablanca" }).format(new Date()) : "Espace de gestion";

  function navigate(next: View) { setView(next); setFeedback(""); }
  function changeStatus(reference: string, next: string) {
    if (!Object.hasOwn(labels, next)) return;
    const issue = setStatus(reference, next);
    if (issue) { setFeedback(issue); return; }
    setFeedback(`${reference} : statut « ${labels[next]} » enregistré dans ce navigateur.`);
  }

  return <div className={styles.app}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo} aria-label="La7ya Store, accueil"><Image src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={160} height={92} priority /></Link>
      <span className={styles.workspaceLabel}>ESPACE DE GESTION</span>
      <nav aria-label="Navigation administrateur" className={styles.navigation}>
        <button type="button" onClick={() => navigate("overview")} aria-current={view === "overview" ? "page" : undefined}><LayoutDashboard size={18} /><span>Vue d’ensemble</span></button>
        <button type="button" onClick={() => navigate("orders")} aria-current={view === "orders" ? "page" : undefined}><ShoppingBag size={18} /><span>Commandes</span>{ready && pending > 0 && <b>{pending}</b>}</button>
        <button type="button" onClick={() => navigate("catalog")} aria-current={view === "catalog" ? "page" : undefined}><Boxes size={18} /><span>Catalogue</span></button>
      </nav>
      <div className={styles.sidebarBottom}><Link href="/" className={styles.storeLink}><ArrowDownLeft size={16} /> Retour à la boutique</Link><div className={styles.profile}><span>LA</span><div><b>Administration</b><small>Session de démonstration</small></div><i /></div></div>
    </aside>
    <div className={styles.content}>
      <div className={styles.topbar}><span>LA7YA STORE <ChevronRight size={12} /> Administration</span><div className={styles.topbarActions}><span className={styles.localBadge}><i /> Données locales</span><ThemeToggle/></div></div>
      <header className={styles.heading}><div><span className={styles.kicker}>{date}</span><h1>{titles[view].title}</h1><p>{titles[view].description}</p></div><span className={styles.demoTag}>MODE DÉMONSTRATION</span></header>
      {!ready ? <div className={styles.loading} role="status"><LayoutDashboard size={26} /><p>Chargement de votre espace de gestion…</p><div /><div /></div> : <>
        <section className={styles.metrics} aria-label="Indicateurs de la boutique">
          <article><div><span>Commandes</span><ShoppingBag size={18} /></div><strong>{orders.length.toLocaleString("fr-MA")}</strong><small>Au total dans ce navigateur</small></article>
          <article className={styles.highlightMetric}><div><span>À confirmer</span><Clock3 size={18} /></div><strong>{pending.toLocaleString("fr-MA")}</strong><small>{pending ? "En attente de votre confirmation" : "Aucune commande en attente"}</small></article>
          <article><div><span>Montant livré</span><PackageCheck size={18} /></div><strong className={styles.moneyMetric}>{money(deliveredTotal)}</strong><small>{delivered.length} commande{delivered.length > 1 ? "s" : ""} livrée{delivered.length > 1 ? "s" : ""} · démo</small></article>
          <article><div><span>Parfums au catalogue</span><Boxes size={18} /></div><strong>{activeProducts.length}</strong><small>{variantCount} formats · flacons et décants</small></article>
        </section>
        <p className={styles.feedback} role="status" aria-live="polite">{feedback && <><Check size={14} /> {feedback}</>}</p>
        {view !== "catalog" ? <div className={view === "overview" ? styles.overviewGrid : styles.ordersView}>
          <section className={styles.panel} aria-labelledby="orders-title"><div className={styles.panelHeading}><div><span className={styles.kicker}>LE SUIVI AU QUOTIDIEN</span><h2 id="orders-title">{view === "overview" ? "Dernières commandes" : "Toutes les commandes"}</h2></div>{view === "overview" ? <button type="button" className={styles.textButton} onClick={() => navigate("orders")}>Tout voir <ArrowRight size={15} /></button> : <span className={styles.count}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>}</div>
            {view === "orders" && <div className={styles.tools}><label className={styles.search}><Search size={17} /><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Référence, client, téléphone ou ville…" aria-label="Rechercher une commande" /></label><label className={styles.filter}><span>Statut</span><select value={status} onChange={event => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filtrer les commandes par statut"><option value="ALL">Tous les statuts</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>}
            {visible.length ? <OrderTable rows={visible} onStatusChange={changeStatus} /> : <div className={styles.empty}><ShoppingBag size={30} strokeWidth={1.3} /><h3>{orders.length ? "Aucune commande correspondante." : "Votre activité commence ici."}</h3><p>{orders.length ? "Modifiez la recherche ou le statut pour retrouver vos commandes." : "Les commandes créées depuis la boutique apparaîtront ici, dans ce navigateur."}</p>{!orders.length && <Link href="/produits" className={styles.primary}>Créer une commande démo <ArrowUpRight size={16} /></Link>}</div>}
            {view === "orders" && filtered.length > pageSize && <nav className={styles.pagination} aria-label="Pagination des commandes"><span>Page {currentPage} sur {pageCount}</span><div><button type="button" aria-label="Page précédente" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><button type="button" aria-label="Page suivante" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></nav>}
          </section>
          {view === "overview" && <aside className={styles.overviewAside}><section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.kicker}>RÉPARTITION DES STATUTS</span><h2>Où en êtes-vous ?</h2></div></div><div className={styles.statusList}>{Object.entries(labels).map(([key, label]) => { const count = orders.filter(order => order.status === key).length; return <div key={key}><div><span><i className={styles[key.toLowerCase()]} />{label}</span><b>{count}</b></div><div className={styles.track}><span className={styles[key.toLowerCase()]} style={{ width: `${orders.length ? count / orders.length * 100 : 0}%` }} /></div></div>; })}</div><div className={styles.activityNote}><b>{active}</b><span>commande{active > 1 ? "s" : ""} confirmée{active > 1 ? "s" : ""}, en préparation ou expédiée{active > 1 ? "s" : ""}</span></div></section><section className={styles.catalogNote}><Boxes size={21} /><span className={styles.kicker}>LE CATALOGUE</span><h3>{activeProducts.length} parfums.<br /><i>Chaque format compte.</i></h3><p>{lowStock} format{lowStock > 1 ? "s" : ""} avec un stock de démonstration de 3 unités ou moins.</p><button type="button" className={styles.textButton} onClick={() => navigate("catalog")}>Consulter le catalogue <ArrowRight size={15} /></button></section></aside>}
        </div> : <section className={styles.panel} aria-labelledby="catalog-title"><div className={styles.panelHeading}><div><span className={styles.kicker}>LES RÉFÉRENCES LA7YA</span><h2 id="catalog-title">Parfums & formats</h2></div><div className={styles.catalogActions}><span className={styles.count}>{catalog.length} parfum{catalog.length > 1 ? "s" : ""}</span><button type="button" className={styles.primary} onClick={() => setEditing(null)}><Plus size={15} /> Ajouter un parfum</button></div></div><div className={styles.tools}><label className={styles.search}><Search size={17} /><input value={catalogQuery} onChange={event => setCatalogQuery(event.target.value)} placeholder="Rechercher un parfum ou une marque…" aria-label="Rechercher dans le catalogue administrateur" /></label><label className={styles.filter}><span>Univers</span><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filtrer le catalogue par univers">{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className={styles.filter}><span>Visibilité</span><select value={archiveFilter} onChange={event => setArchiveFilter(event.target.value)} aria-label="Filtrer les produits actifs ou archivés"><option value="active">En vente</option><option value="archived">Archivés</option><option value="all">Tous les produits</option></select></label></div><p className={styles.catalogDisclaimer}>Gestion locale · les commandes ajustent les stocks disponibles, les annulations les restaurent.</p>
          {catalog.length ? <div className={styles.catalogGrid}>{catalog.map(product => <article className={styles.productCard} key={product.id}><div className={styles.productHeading}><div className={styles.productImage}><Image src={product.image} alt="" fill sizes="64px" /></div><div><small>{product.brand}</small><h3>{product.name}</h3><p>{product.category}</p></div><Link href={`/produits/${product.slug}`} aria-label={`Voir la fiche de ${product.name}`}><ArrowUpRight size={18} /></Link></div><ul className={styles.variants}>{product.variants.filter(variant => category !== "Décants" || variant.kind === "decant").map(variant => <li key={variant.id}><span>{variant.kind === "decant" ? "Décant" : "Flacon"}<small>{variant.label}</small></span><b>{money(variant.price)}</b><span className={`${styles.stock} ${variant.stock === 0 ? styles.outOfStock : variant.stock <= 3 ? styles.lowStock : ""}`}>{variant.stock === 0 ? "Épuisé" : `${variant.stock} en stock`}</span></li>)}</ul><div className={styles.productActions}><button type="button" onClick={() => setEditing(product)}><Pencil size={13} /> Modifier</button><button type="button" onClick={() => { const issue = setArchived(product.id, !product.archived); setFeedback(issue || `${product.name} : ${product.archived ? "remis en vente" : "archivé. Retrouvez-le dans le filtre Archivés"}.`); }}>{product.archived ? "Remettre en vente" : "Archiver"}</button></div></article>)}</div> : <div className={styles.empty}><Boxes size={30} strokeWidth={1.3} /><h3>Aucun parfum trouvé.</h3><p>Modifiez la recherche ou l’univers sélectionné.</p></div>}
        </section>}
        <footer className={styles.footnote}><span><i /> Espace de démonstration</span><p>Commandes conservées dans ce navigateur · aucune transaction réelle · administration sans authentification.</p></footer>
      </>}
    </div>
    {editing !== undefined && <ProductEditor product={editing} onClose={() => setEditing(undefined)} onSaved={name => { setEditing(undefined); setView("catalog"); setCatalogQuery(""); setCategory("Tous"); setArchiveFilter("all"); setFeedback(`${name} : produit enregistré. La boutique est à jour dans ce navigateur.`); }} />}
  </div>;
}

function OrderTable({ rows, onStatusChange }: { rows: DemoOrder[]; onStatusChange: (reference: string, status: string) => void }) {
  const { findVariant } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className={styles.tableWrap}><table className={styles.table}><caption className={styles.srOnly}>Commandes de démonstration. Sélectionnez une référence pour consulter ses détails.</caption><thead><tr><th scope="col">Commande</th><th scope="col">Client</th><th scope="col">Réception</th><th scope="col">Total</th><th scope="col">Statut</th></tr></thead><tbody>{rows.map(order => {
    const open = expanded === order.reference;
    const detailId = `order-${order.reference}`;
    return <Fragment key={order.reference}><tr className={open ? styles.openRow : ""}><td data-label="Commande"><button type="button" className={styles.referenceButton} aria-label={`Détails de la commande ${order.reference}`} aria-expanded={open} aria-controls={detailId} onClick={() => setExpanded(open ? null : order.reference)}>{order.reference}<ChevronDown size={13} /></button><small>{orderDate(order.createdAt)}</small></td><td data-label="Client"><span className={styles.clientName}>{order.name}</span><small>{order.phone}</small></td><td data-label="Réception"><span>{order.delivery === "Retrait en boutique" ? "Retrait" : "Livraison"}</span><small>{order.city}</small></td><td data-label="Total"><b className={styles.orderTotal}>{money(order.total)}</b></td><td data-label="Statut"><select className={`${styles.statusSelect} ${styles[order.status.toLowerCase()] || ""}`} value={order.status} aria-label={`Statut de ${order.reference}`} onChange={event => onStatusChange(order.reference, event.target.value)}>{!Object.hasOwn(labels, order.status) && <option value={order.status}>Statut inconnu</option>}{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>
      {open && <tr id={detailId} className={styles.detailRow}><td colSpan={5}><div className={styles.orderDetails}><section><span className={styles.kicker}>COORDONNÉES & RÉCEPTION</span><h3>{order.name}</h3><p>{order.phone}<br />{order.city}</p><p>{order.address}</p><small>{order.delivery}</small></section><section><span className={styles.kicker}>ARTICLES DE LA COMMANDE</span><ul>{order.items.map((line, index) => { const found = findVariant(line.variantId); return <li key={`${line.variantId}-${index}`}><span>{line.productName || found?.product.name || "Article indisponible"}<small>{line.variantLabel ? `${line.kind === "decant" ? "Décant" : "Flacon"} · ${line.variantLabel}` : found ? `${found.variant.kind === "decant" ? "Décant" : "Flacon"} · ${found.variant.label}` : "Référence absente du catalogue"}</small></span><b>× {line.quantity}</b></li>; })}</ul><Link href={`/commande/confirmation/${encodeURIComponent(order.reference)}`} className={styles.textButton}>Voir le récapitulatif <ArrowUpRight size={14} /></Link></section></div></td></tr>}
    </Fragment>;
  })}</tbody></table></div>;
}

