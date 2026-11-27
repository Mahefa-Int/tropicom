import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Contact — Tropi'Com",
  description:
    "Et si on faisait décoller votre projet ? Écrivez-nous, appelez-nous ou passez par WhatsApp : l'équipe Tropi'Com vous répond du lundi au vendredi, de 9 h à 17 h.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
