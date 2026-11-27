import type { Metadata } from "next";
import MethodBlock from "@/components/MethodBlock";
import RevealObserver from "@/components/RevealObserver";
import HorizontalCases from "@/components/HorizontalCases";
import GalleryCases from "@/components/GalleryCases";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { caseCard, parseDetails } from "@/lib/cases";

/** Page de test (non liée dans le menu) : essais de sections avant de les placer sur le site. */
export const metadata: Metadata = { title: "Essais", robots: { index: false } };

export const dynamic = "force-dynamic";

export default async function EssaiPage() {
  // études de cas publiées (admin → Réalisations), dans l'ordre d'affichage
  const rows = await db
    .select()
    .from(schema.caseStudies)
    .where(eq(schema.caseStudies.status, "published"))
    .orderBy(asc(schema.caseStudies.sortOrder), asc(schema.caseStudies.id))
    .catch(() => []);
  const cases = rows.map((r) => caseCard(r, parseDetails(r.details)));
  return (
    <>
    <main className="essai">
      <h1>Essai : défilement horizontal des études de cas</h1>
    </main>
    <HorizontalCases cases={cases} />
    <main className="essai">
      <h1>Essai : galerie horizontale des études de cas</h1>
    </main>
    <GalleryCases cases={cases} />
    <main className="essai">
      <h1>Mis de côté : « Cinq temps. Zéro improvisation. » (retiré de l&apos;accueil)</h1>
    </main>
    <MethodBlock />
    <RevealObserver />
    </>
  );
}
