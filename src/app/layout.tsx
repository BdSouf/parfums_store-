import type {Metadata} from "next";
import {Instrument_Serif,Inter} from "next/font/google";
import "./globals.css";
import {StoreProvider} from "@/lib/store";
import {AppShell} from "@/components/app-shell";
import {Suspense} from "react";
import {MarketProvider} from "@/components/market-context";
import "@/components/market.css";
import "@/components/heritage.css";
const display=Instrument_Serif({subsets:["latin"],variable:"--font-display",weight:"400"});
const sans=Inter({subsets:["latin"],variable:"--font-sans"});
export const metadata:Metadata={title:{default:"La7ya Store — Démonstration",template:"%s | La7ya Store"},description:"Concept e-commerce non officiel pour une parfumerie à Rabat.",robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr" suppressHydrationWarning><body className={`${display.variable} ${sans.variable}`}><StoreProvider><Suspense fallback={<div role="status">La7ya · Chargement / تحميل…</div>}><MarketProvider><AppShell>{children}</AppShell></MarketProvider></Suspense></StoreProvider></body></html>}
