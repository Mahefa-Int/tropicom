import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Resources from "@/components/Resources";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Ressources — Tropi'Com",
  description:
    "Études, guides pratiques et analyses pour les professionnels du tourisme de l'Océan Indien : l'Observatoire 2026 du digital touristique, guides PDF et journal.",
};

export default function RessourcesPage() {
  return (
    <>
      <Navbar />
      <main>
        <Resources />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
