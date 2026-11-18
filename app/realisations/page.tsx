import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import RealisationsHero from "@/components/RealisationsHero";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Nos réalisations — Tropi'Com",
  description:
    "Hôtels, lodges, tour-opérateurs, tables et salons : huit études de cas en trois temps, la situation de départ, notre réponse et les résultats.",
};

export default function RealisationsPage() {
  return (
    <>
      <Navbar />
      <main>
        <RealisationsHero />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
