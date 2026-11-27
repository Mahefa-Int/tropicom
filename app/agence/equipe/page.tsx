import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AgencyHero from "@/components/AgencyHero";
import AgencyStory from "@/components/AgencyStory";
import AgencyClick from "@/components/AgencyClick";
import AgencyToday from "@/components/AgencyToday";
import AgencyValues from "@/components/AgencyValues";
import AgencyJoin from "@/components/AgencyJoin";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  alternates: { canonical: "/agence/equipe" },
  title: "L'équipe",
  description: "Qui sommes-nous : l'équipe Tropi'Com, agence digitale basée à Madagascar, au service de l'hôtellerie de l'Océan Indien.",
};

export default function EquipePage() {
  return (
    <>
      <Navbar />
      <main>
        <AgencyHero />
        <AgencyStory />
        <AgencyClick />
        <AgencyToday />
        <AgencyValues />
        <AgencyJoin />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
