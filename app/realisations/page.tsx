import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { caseCard, parseDetails } from "@/lib/cases";
import RealisationsHero from "@/components/RealisationsHero";
import RealisationsList from "@/components/RealisationsList";
import RealisationsSphere from "@/components/RealisationsSphere";
import RealisationsTable from "@/components/RealisationsTable";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Nos réalisations — Tropi'Com",
  description:
    "Hôtels, lodges, tour-opérateurs, tables et salons : études de cas en trois temps, la situation de départ, notre réponse et les résultats.",
};

/** liste dynamique : réalisations publiées (admin → Réalisations), dans l'ordre d'affichage */
export const dynamic = "force-dynamic";

export default async function RealisationsPage() {
  // base indisponible (hébergement sans base configurée) : la page s'affiche quand même, sans liste
  const rows = await db
    .select()
    .from(schema.caseStudies)
    .where(eq(schema.caseStudies.status, "published"))
    .orderBy(asc(schema.caseStudies.sortOrder), asc(schema.caseStudies.id))
    .catch((e) => {
      console.error("Réalisations : base de données indisponible", e);
      return [];
    });
  const cards = rows.map((r) => caseCard(r, parseDetails(r.details)));
  return (
    <>
      <Navbar />
      <main>
        <RealisationsHero count={cards.length} />
        {/* sphère « Projets » puis tableau « Études & résultats » (animations de la vidéo de référence) */}
        <RealisationsSphere cards={cards} />
        <RealisationsTable cards={cards} />
        <RealisationsList cards={[]} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
