"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { categories, variantVolumeMl, type Product, type Variant } from "@/lib/data";
import { productError, uniqueProductSlug } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import styles from "./product-editor.module.css";

type DraftVariant = { id: string; kind: Variant["kind"]; volume: string; price: string; stock: string };
export function ProductEditor({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: (name: string) => void }) {
  const { products, saveProduct } = useStore();
  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [category, setCategory] = useState(product?.category || categories[1]);
  const [description, setDescription] = useState(product?.description || "");
  const [notes, setNotes] = useState(product?.notes || ["", "", ""]);
  const [image, setImage] = useState(product?.image || "");
  const [accent, setAccent] = useState(product?.accent || "#8c6239");
  const [badge, setBadge] = useState(product?.badge || "");
  const [variants, setVariants] = useState<DraftVariant[]>(() => product?.variants.map(variant => ({ id: variant.id, kind: variant.kind, volume: String(variantVolumeMl(variant) || 100), price: String(variant.price), stock: String(variant.stock) })) || [{ id: "new-0", kind: "bottle", volume: "100", price: "", stock: "0" }]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reader = useRef<FileReader | null>(null);
  const errorNotice = useRef<HTMLParagraphElement>(null);
  const idCounter = useRef(1);
  const [initial] = useState(() => JSON.stringify({ name, brand, category, description, notes, image, accent, badge, variants }));
  const dirty = JSON.stringify({ name, brand, category, description, notes, image, accent, badge, variants }) !== initial;
  const library = Array.from(new Set(products.map(item => item.image).filter(source => source.startsWith("/"))));

  useEffect(() => {
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLInputElement>('input[name="product-name"]')?.focus();
    const element = dialog.current;
    return () => { reader.current?.abort(); element?.close(); };
  }, []);
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (dirty) event.preventDefault(); }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  useEffect(() => { if (error) errorNotice.current?.focus(); }, [error]);
  function close() { if (!dirty || window.confirm("Quitter sans enregistrer les modifications de ce produit ?")) onClose(); }
  function updateVariant(id: string, field: keyof DraftVariant, value: string) {
    setVariants(rows => rows.map(row => row.id === id ? { ...row, [field]: value, ...(field === "kind" ? { volume: value === "decant" ? "5" : "100" } : {}) } : row));
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 600 * 1024) { setError("Choisissez une image PNG, JPEG ou WebP de 600 Ko maximum."); return; }
    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file); bitmap.close();
      const fileReader = new FileReader(); reader.current = fileReader;
      fileReader.onload = () => { setImage(String(fileReader.result)); setUploading(false); };
      fileReader.onerror = () => { setError("Cette image n’a pas pu être lue. Réessayez avec un autre fichier."); setUploading(false); };
      fileReader.readAsDataURL(file);
    } catch { setError("Le fichier n’est pas une image lisible."); setUploading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const id = product?.id || `product-${crypto.randomUUID()}`;
    const next: Product = {
      ...product, id, slug: product?.slug || uniqueProductSlug(brand, name, products), name: name.trim(), brand: brand.trim(), category, description: description.trim(), notes: notes.map(note => note.trim()), image, accent, badge: badge.trim() || undefined,
      variants: variants.map(row => ({ id: product?.variants.some(variant => variant.id === row.id) ? row.id : `${id}-${crypto.randomUUID()}`, kind: row.kind, label: `${Number(row.volume)} ml`, price: Number(row.price), stock: Number(row.stock) })),
    };
    const issue = productError(next) || saveProduct(next);
    if (issue) { setError(issue); return; }
    onSaved(next.name);
  }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="product-editor-title" onCancel={event => { event.preventDefault(); close(); }}><form onSubmit={submit}>
    <header className={styles.header}><span>LE CATALOGUE LA7YA</span><h2 id="product-editor-title">{product ? "Modifier le parfum." : "Ajouter un parfum."}</h2><p>Choisissez un univers, puis les formats que vous souhaitez proposer.</p></header>
    <div className={styles.body}>
      <fieldset><legend>01 <span>Le parfum</span></legend><div className={styles.grid}>
        <label>Nom du parfum<input name="product-name" value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={120} placeholder="Ex. Oud Sultan" /></label>
        <label>Marque<input value={brand} onChange={event => setBrand(event.target.value)} required minLength={2} maxLength={100} placeholder="La maison de parfum" /></label>
        <label>Univers<select value={category} onChange={event => setCategory(event.target.value)}>{categories.slice(1, 4).map(value => <option key={value}>{value}</option>)}</select><small>Les décants sont des formats, pas un univers.</small></label>
        <label>Étiquette <small>(facultatif)</small><input value={badge} onChange={event => setBadge(event.target.value)} maxLength={30} placeholder="Ex. Nouveau" /></label>
        <label className={styles.full}>Description<textarea value={description} onChange={event => setDescription(event.target.value)} required minLength={10} maxLength={1000} rows={3} placeholder="Décrivez la personnalité et les sensations de ce parfum." /></label>
      </div><div className={styles.notes}>{notes.map((note, index) => <label key={index}>Note olfactive {index + 1}<input value={note} onChange={event => setNotes(notes.map((value, position) => position === index ? event.target.value : value))} required maxLength={60} placeholder={["Oud", "Ambre", "Vanille"][index]} /></label>)}</div></fieldset>
      <fieldset><legend>02 <span>Le visuel</span></legend><div className={styles.visual}><div className={styles.preview} style={{ backgroundColor: accent }}>{image ? <Image src={image} alt="Aperçu du parfum" fill sizes="120px" unoptimized /> : <span>Votre<br />visuel</span>}</div><div className={styles.imageFields}><label>Image du catalogue<select value={image.startsWith("data:") ? "custom" : image} onChange={event => setImage(event.target.value)}><option value="">Choisir une image existante</option>{image.startsWith("data:") && <option value="custom">Image importée</option>}{library.map(source => <option key={source} value={source}>{products.find(item => item.image === source)?.name || source.split("/").pop()}</option>)}</select></label><label>Ou importer votre image<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /><small>{uploading ? "Lecture de l’image…" : "PNG, JPEG ou WebP · 600 Ko maximum · conservée dans ce navigateur"}</small></label><label className={styles.color}>Ambiance du visuel<input type="color" value={accent} onChange={event => setAccent(event.target.value)} /></label></div></div></fieldset>
      <fieldset><legend>03 <span>Formats, prix & stocks</span></legend><p className={styles.hint}>Un flacon complet, des décants, ou les deux. Le stock correspond aux unités disponibles à la vente.</p><div className={styles.variants}>{variants.map((row, index) => <div key={row.id} className={styles.variant}>
        <label>Type<select value={row.kind} onChange={event => updateVariant(row.id, "kind", event.target.value)}><option value="bottle">Flacon original</option><option value="decant">Décant</option></select></label>
        <label>Volume (ml){row.kind === "decant" ? <select value={row.volume} onChange={event => updateVariant(row.id, "volume", event.target.value)}>{[5, 10, 20].map(volume => <option key={volume}>{volume}</option>)}</select> : <input type="number" min={1} max={5000} step={1} required value={row.volume} onChange={event => updateVariant(row.id, "volume", event.target.value)} />}</label>
        <label>Prix (MAD)<input type="number" min="0.01" max={100000} step="0.01" required value={row.price} onChange={event => updateVariant(row.id, "price", event.target.value)} /></label>
        <label>Stock<input type="number" min={0} max={100000} step={1} required value={row.stock} onChange={event => updateVariant(row.id, "stock", event.target.value)} /></label>
        <button type="button" disabled={variants.length === 1} aria-label={`Retirer le format ${index + 1}`} onClick={() => setVariants(variants.filter(variant => variant.id !== row.id))}><Trash2 size={16} /></button>
      </div>)}</div><button type="button" className={styles.addFormat} disabled={variants.length >= 12} onClick={() => setVariants([...variants, { id: `new-${idCounter.current++}`, kind: "decant", volume: "5", price: "", stock: "0" }])}><Plus size={15} /> Ajouter un format</button></fieldset>
      {error && <p ref={errorNotice} tabIndex={-1} className={styles.error} role="alert">{error}</p>}
    </div><footer className={styles.footer}><button type="button" onClick={close}>Annuler</button><button type="submit" disabled={uploading}>Enregistrer le parfum <ArrowRight size={17} /></button></footer>
  </form></dialog>;
}
