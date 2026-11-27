import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import CtaIcon from "@/components/CtaIcon";
import NotFoundBg from "@/components/NotFoundBg";

/**
 * Page 404 (lien cassé, adresse inexistante) : même fond lumineux que les pages Contact et maintenance,
 * grand « 404 » pâle derrière le titre, bouton de retour à l'accueil. Hauteur de l'écran.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main>
        <section className="nf" aria-labelledby="nf-title">
          <NotFoundBg />
          <p className="nf-num" aria-hidden="true">
            404
          </p>
          <div className="nf-in">
            <h1 className="nf-title" id="nf-title">
              Cette page s’est <em>envolée.</em>
            </h1>
            <p className="nf-text">Le lien est peut-être cassé, ou la page a changé d’adresse. Repartons de l’accueil.</p>
            <Link href="/" className="cta nf-cta">
              <CtaIcon />
              <span className="cta-label">Retour à l’accueil</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
