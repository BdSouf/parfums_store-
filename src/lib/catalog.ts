import { categories, variantVolumeMl, type Product } from "./data";

export function productError(product: Product): string | null {
  if (!product.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) return "La référence du produit est invalide.";
  if (product.name.trim().length < 2 || product.name.length > 120 || product.brand.trim().length < 2 || product.brand.length > 100) return "Renseignez un nom et une marque de 2 caractères minimum.";
  if (!categories.slice(1, 4).includes(product.category)) return "Choisissez un univers pour ce parfum.";
  if (product.description.trim().length < 10 || product.description.length > 1000) return "La description doit contenir entre 10 et 1 000 caractères.";
  if (product.notes.length !== 3 || product.notes.some(note => !note.trim() || note.length > 60)) return "Renseignez les trois notes olfactives (60 caractères maximum chacune).";
  if (!/^#[a-f0-9]{6}$/i.test(product.accent)) return "Choisissez une couleur valide.";
  if (!( /^\/(?:products\/catalog|images)\/[a-z0-9._-]+\.(?:png|jpg|jpeg|webp)$/i.test(product.image) || /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(product.image) && product.image.length <= 850000 )) return "Choisissez une image du catalogue ou importez une image PNG, JPEG ou WebP de 600 Ko maximum.";
  if (!product.variants.length || product.variants.length > 12) return "Ajoutez entre 1 et 12 formats.";
  const ids = new Set<string>(), formats = new Set<string>();
  for (const variant of product.variants) {
    const volume = variantVolumeMl(variant);
    if (!variant.id || ids.has(variant.id)) return "Deux formats ont la même référence.";
    ids.add(variant.id);
    if (!Number.isFinite(variant.price) || variant.price <= 0 || variant.price > 100000 || Math.abs(variant.price * 100 - Math.round(variant.price * 100)) > .00001) return "Chaque format doit avoir un prix positif, avec deux décimales maximum.";
    if (!Number.isInteger(variant.stock) || variant.stock < 0 || variant.stock > 100000) return "Chaque stock doit être un entier entre 0 et 100 000.";
    if (!volume || !Number.isInteger(volume) || volume > 5000 || !["bottle", "decant"].includes(variant.kind) || variant.kind === "decant" && ![5, 10, 20].includes(volume)) return "Choisissez un volume valide : 5, 10 ou 20 ml pour un décant.";
    const format = `${variant.kind}-${volume}`;
    if (formats.has(format)) return "Un même format ne peut pas être ajouté deux fois.";
    formats.add(format);
  }
  return null;
}

export function uniqueProductSlug(brand: string, name: string, products: Product[]): string {
  const base = `${brand}-${name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "parfum";
  let slug = base, suffix = 2;
  while (products.some(product => product.slug === slug)) slug = `${base}-${suffix++}`;
  return slug;
}
