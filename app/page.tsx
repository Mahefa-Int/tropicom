import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Trust from "@/components/Trust";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import MethodBlock from "@/components/MethodBlock";
import Proof from "@/components/Proof";
import CaseStack from "@/components/CaseStack";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <Trust />
        <Services />
        <Proof />
        <CaseStack />
        <Stats />
        <MethodBlock />
      </main>
      <Footer />
      {/* Ajoute .in-view aux sections [data-reveal] quand elles arrivent à l'écran */}
      <RevealObserver />
    </>
  );
}
