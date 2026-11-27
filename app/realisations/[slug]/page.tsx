import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getAdminUser } from "@/lib/admin/dal";
import { fullTitle, nextCard, parseDetails, type CaseData } from "@/lib/cases";
import type { CaseStudy as Row } from "@/lib/db/schema";
import Navbar from "@/components/Navbar";
import CaseStudy from "@/components/CaseStudy";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";

/**
 * Page d'une réalisation, contenu géré dans l'admin (Réalisations).
 * Seules les réalisations publiées sont visibles ; un administrateur connecté voit aussi les brouillons (aperçu).
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const getCase = cache(async (slug: string) => {
  const row = (await db.select().from(schema.caseStudies).where(eq(schema.caseStudies.slug, slug)).limit(1))[0];
  if (!row) return null;
  if (row.status !== "published" && !(await getAdminUser())) return null;
  return row;
});

/** projet suivant : celui choisi dans l'admin s'il est publié, sinon le suivant dans l'ordre (en boucle) */
async function nextOf(row: Row, nextId: number | null): Promise<CaseData["next"]> {
  const pub = await db
    .select()
    .from(schema.caseStudies)
    .where(eq(schema.caseStudies.status, "published"))
    .orderBy(asc(schema.caseStudies.sortOrder), asc(schema.caseStudies.id));
  const others = pub.filter((c) => c.id !== row.id);
  if (!others.length) return null;
  let n = nextId ? others.find((c) => c.id === nextId) : undefined;
  if (!n) {
    const i = pub.findIndex((c) => c.id === row.id);
    n = i < 0 ? others[0] : pub.slice(i + 1).concat(pub.slice(0, i))[0];
  }
  return nextCard(n, parseDetails(n.details));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getCase((await params).slug);
  if (!row) return { title: "Réalisation introuvable" };
  const d = parseDetails(row.details);
  return {
    title: d.seoTitle || fullTitle(d) || row.title,
    description: d.seoDescription || undefined,
    robots: row.status === "published" ? undefined : { index: false },
    openGraph: row.coverUrl ? { images: [row.coverUrl] } : undefined,
    alternates: { canonical: `/realisations/${row.slug}` },
  };
}

export default async function RealisationPage({ params }: Props) {
  const row = await getCase((await params).slug);
  if (!row) notFound();
  const details = parseDetails(row.details);
  const data: CaseData = {
    name: row.client || row.title,
    details,
    heroSrc: row.coverUrl,
    next: await nextOf(row, details.nextId),
  };
  return (
    <>
      <Navbar />
      <main>
        <CaseStudy data={data} />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
