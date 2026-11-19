import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

/** Prise de rendez-vous : prototype de présentation pour le client (non lié dans le menu, non indexé). */
export const metadata: Metadata = {
  title: "Prendre rendez-vous — Tropi'Com",
  description: "Réservez un diagnostic offert ou un point projet avec l'équipe Tropi'Com, en visio ou par téléphone.",
  robots: { index: false },
};

export default function RendezVousPage() {
  return (
    <>
      <Navbar />
      <main>
        <Booking />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
