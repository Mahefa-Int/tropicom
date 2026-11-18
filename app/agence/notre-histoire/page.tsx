import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TeamHero from "@/components/TeamHero";
import TeamDirection from "@/components/TeamDirection";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Notre histoire — Tropi'Com",
  description:
    "Des spécialistes, pas des polyvalents : stratégie, direction artistique, production, acquisition, technologie, avec un interlocuteur unique.",
};

export default function NotreHistoirePage() {
  return (
    <>
      <Navbar />
      <main>
        <TeamHero />
        <TeamDirection />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
