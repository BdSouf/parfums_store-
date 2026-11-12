"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header, Footer, ThemeToggle } from "@/components/layout";
import { useStore } from "@/lib/store";
import styles from "./purchase-shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const admin = path.startsWith("/admin");
  const purchase = path === "/panier" || path === "/commande" || path.startsWith("/commande/confirmation/");
  const themedPurchase = path === "/panier" || path === "/commande" || path.startsWith("/commande/confirmation/");
  const { storageError } = useStore();
  const shell = admin ? "admin-shell" : purchase ? "purchase-shell" : "storefront-shell";
  return <div className={`app-shell ${shell}`}>
    {purchase ? <header className={`${styles.header} ${themedPurchase?styles.themeScope:""}`}><Link href="/" className={styles.logo} aria-label="La7ya Store, accueil"><Image src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={120} height={70} priority /></Link><div className={styles.headerActions}><span>MAISON LA7YA · RABAT</span>{themedPurchase&&<ThemeToggle/>}</div></header> : !admin && <Header />}
    {storageError && <p className={styles.storageError} role="alert">{storageError}</p>}
    <main>{children}</main>
    {purchase ? <footer className={`${styles.footer} ${themedPurchase?styles.themeScope:""}`}><span>LA7YA STORE · RABAT</span><span>Parcours de démonstration · aucune transaction réelle</span></footer> : !admin && <Footer />}
  </div>;
}

