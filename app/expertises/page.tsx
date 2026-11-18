import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ExpertisesHero from "@/components/ExpertisesHero";
import ExpertisesRibbons from "@/components/ExpertisesRibbons";
import ExpertisesFor from "@/components/ExpertisesFor";
import ExpertisesPoles from "@/components/ExpertisesPoles";
import ExpertisesCta from "@/components/ExpertisesCta";
import ExpertisesLine from "@/components/ExpertisesLine";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Expertises — Tropi'Com",
  description:
    "Tout ce qui se passe entre le rêve d'un voyageur et sa réservation : marque, contenu, acquisition, academy et labs, cinq expertises qui se renforcent entre elles.",
};

export default function ExpertisesPage() {
  return (
    <>
      <Navbar />
      <main>
        <ExpertisesHero />
        <ExpertisesLine>
          <ExpertisesRibbons />
          <ExpertisesFor />
          <ExpertisesPoles />
          <ExpertisesCta />
        </ExpertisesLine>
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
