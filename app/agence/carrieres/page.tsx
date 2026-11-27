import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { CareersHero, CareersMindset, CareersOffer } from "@/components/Careers";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  alternates: { canonical: "/agence/carrieres" },
  title: "Carrières",
  description: "Rejoindre Tropi'Com : faire rayonner l'océan Indien, depuis l'océan Indien. Postes ouverts et candidature spontanée.",
};

export default function CarrieresPage() {
  return (
    <>
      <Navbar />
      <main>
        <CareersHero />
        <CareersMindset />
        <CareersOffer />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
