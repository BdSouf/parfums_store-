import type { Metadata } from "next";
import { products } from "@/lib/data";
import { ProductRoute } from "./product-route";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) return { title: "Parfum — Catalogue local", description: "Découvrez les parfums et formats du catalogue de démonstration La7ya Store." };
  return { title: `${product.name} — ${product.brand}`, description: `${product.description} Découvrez les formats flacon et décant dans le catalogue de démonstration La7ya Store.` };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductRoute slug={slug} />;
}
