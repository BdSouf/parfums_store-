import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound(){
  return <div className={`nocturne-home ${styles.page}`}>
    <section className={styles.stage} aria-labelledby="not-found-title">
      <div className={styles.copy}>
        <span className="nocturne-kicker">ERREUR 404 · HORS COLLECTION</span>
        <span className={styles.number} aria-hidden="true">404</span>
        <h1 id="not-found-title">Cette page s’est<br/><i>évaporée.</i></h1>
        <p>Comme une note de tête, elle a laissé une trace puis disparu. Retrouvez votre chemin vers la collection La7ya.</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>Retour à l’accueil <ArrowLeft size={17}/></Link>
          <Link href="/produits" className={styles.secondary}>Explorer les parfums <ArrowRight size={17}/></Link>
        </div>
      </div>
      <div className={styles.visual} aria-hidden="true">
        <span className={styles.orbit}/>
        <span className={styles.word}>ABSENT</span>
        <Image src="/images/web-sources/xerjoff-naxos-web.png" alt="" fill priority sizes="(max-width: 750px) 85vw, 48vw"/>
        <small>UN SILLAGE PEUT TOUJOURS ÊTRE RETROUVÉ.</small>
      </div>
    </section>
  </div>;
}
