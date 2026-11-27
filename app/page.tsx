import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Trust from "@/components/Trust";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Proof from "@/components/Proof";
import CaseStack from "@/components/CaseStack";
import TestimonialsSection from "@/components/TestimonialsSection";
import Why from "@/components/Why";
import Destinations from "@/components/Destinations";
import Strengths from "@/components/Strengths";
import Journey from "@/components/Journey";
import Observatory from "@/components/Observatory";
import Faq from "@/components/Faq";
import ContactCta from "@/components/ContactCta";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

/** données structurées (Google) : l'agence, ses coordonnées et sa page Facebook */
const SITE_URL = process.env.SITE_URL || "https://www.tropicomagency.com";
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Tropi'Com",
  alternateName: "Tropi'Com Agency Madagascar",
  description: "Agence de marketing digital et d'automatisation dédiée aux hôtels, lodges et tour-opérateurs de l'océan Indien.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-tropicom.webp`,
  image: `${SITE_URL}/opengraph-image.jpg`,
  email: "admin@tropicomagency.com",
  telephone: "+261386049449",
  address: { "@type": "PostalAddress", streetAddress: "III G Bis Andrefan'Ambohijanahary", addressLocality: "Antananarivo", postalCode: "101", addressCountry: "MG" },
  areaServed: ["Madagascar", "La Réunion", "Maurice", "Seychelles", "Océan Indien"],
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" }],
  sameAs: ["https://www.facebook.com/share/1DcJ6iKm27/?mibextid=wwXIfr"],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Navbar />
      <main>
        <Hero />
        <Intro />
        <Trust />
        {/* « Ce que ça change, concrètement. » : titre + les études de cas empilées */}
        <Proof />
        <CaseStack />
        <Services />
        <Stats />
        <TestimonialsSection />
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
