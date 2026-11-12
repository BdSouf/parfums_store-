import type {Metadata} from "next";
import {Instrument_Serif,Inter} from "next/font/google";
import "./globals.css";
import {StoreProvider} from "@/lib/store";
import {AppShell} from "@/components/app-shell";
const display=Instrument_Serif({subsets:["latin"],variable:"--font-display",weight:"400"});
const sans=Inter({subsets:["latin"],variable:"--font-sans"});
export const metadata:Metadata={title:{default:"La7ya Store — Démonstration",template:"%s | La7ya Store"},description:"Concept e-commerce non officiel pour une parfumerie à Rabat."};
const themeScript=`(()=>{try{const saved=localStorage.getItem("la7ya-theme");const theme=saved==="light"||saved==="dark"?saved:matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{}})()`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body className={`${display.variable} ${sans.variable}`}><StoreProvider><AppShell>{children}</AppShell></StoreProvider></body></html>}
