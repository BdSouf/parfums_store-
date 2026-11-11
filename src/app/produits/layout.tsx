import {Suspense} from "react";
export default function ProductsLayout({children}:{children:React.ReactNode}){
  return <Suspense fallback={<section className="section">Chargement du catalogue…</section>}>{children}</Suspense>;
}
