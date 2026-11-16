import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AgencyHero from "@/components/AgencyHero";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "L'Agence — Tropi'Com",
  description: "Qui sommes-nous : l'équipe Tropi'Com, agence digitale basée à Madagascar, au service de l'hôtellerie de l'Océan Indien.",
};

export default function AgencePage() {
  return (
    <>
      <Navbar />
      <main>
        <AgencyHero />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
