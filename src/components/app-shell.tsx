"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Header, Footer } from "@/components/layout";
import { useStore } from "@/lib/store";
import styles from "./purchase-shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const admin = path.startsWith("/admin");
  const purchase = path === "/panier" || path === "/commande" || path.startsWith("/commande/confirmation/");
  const reduce = useReducedMotion();
  const { storageError } = useStore();
  return <>
    {purchase ? <header className={styles.header}><Link href="/" className={styles.logo} aria-label="La7ya Store, accueil"><Image src="/brand/la7ya-logo-clean.png" alt="La7ya Store" width={120} height={70} priority /></Link><span>MAISON LA7YA · RABAT</span></header> : !admin && <Header />}
    {storageError && <p className={styles.storageError} role="alert">{storageError}</p>}
    <motion.main key={path} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : .28 }}>{children}</motion.main>
    {purchase ? <footer className={styles.footer}><span>LA7YA STORE · RABAT</span><span>Parcours de démonstration · aucune transaction réelle</span></footer> : !admin && <Footer />}
  </>;
}

