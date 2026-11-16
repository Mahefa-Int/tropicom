import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Trust from "@/components/Trust";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import MethodBlock from "@/components/MethodBlock";
import Proof from "@/components/Proof";
import CaseStack from "@/components/CaseStack";
import Testimonials from "@/components/Testimonials";
import Why from "@/components/Why";
import Destinations from "@/components/Destinations";
import Strengths from "@/components/Strengths";
import Journey from "@/components/Journey";
import Observatory from "@/components/Observatory";
import Faq from "@/components/Faq";
import ContactCta from "@/components/ContactCta";
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
        <Testimonials />
        {/* Pourquoi → atouts → destinations, reliés par une seule ligne */}
        <Journey>
          <Why />
          <Strengths />
          <Destinations />
        </Journey>
        <Observatory />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
      {/* Ajoute .in-view aux sections [data-reveal] quand elles arrivent à l'écran */}
      <RevealObserver />
    </>
  );
}
