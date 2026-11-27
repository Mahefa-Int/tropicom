import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExpertiseDetail from "@/components/ExpertiseDetail";
import ExpertisesNav from "@/components/ExpertisesNav";
import ExpertisesCta from "@/components/ExpertisesCta";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import { EXPERTISES } from "@/lib/expertises";
import { CONTENT } from "@/lib/expertises-content";

/**
 * Page d'une expertise (sous-menu « Expertises ») : ouverture, liste, rubriques du pôle, autres expertises, appel à l'action.
 */
type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return EXPERTISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = EXPERTISES.find((x) => x.slug === slug);
  if (!e) return {};
  return { title: `${e.label} — Expertises`, description: `${e.full} : ${e.promise}`, alternates: { canonical: `/expertises/${e.slug}` } };
}

export default async function ExpertisePage({ params }: Props) {
  const { slug } = await params;
  const e = EXPERTISES.find((x) => x.slug === slug);
  const c = CONTENT[slug];
  if (!e || !c) notFound();

  return (
    <>
      <Navbar />
      <main>
        <ExpertiseDetail e={e} c={c} />
        <ExpertisesNav current={e.slug} />
        <ExpertisesCta />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
