/**
 * Les 5 expertises (pôles) : une page chacune (/expertises/[slug]), un sous-menu dans la barre de navigation,
 * et une grille de liens sur la page /expertises (vue d'ensemble).
 */
export type Expertise = { n: number; slug: string; label: string; full: string; promise: string; img: string };

export const EXPERTISES: Expertise[] = [
  { n: 1, slug: "marque", label: "Marque", full: "Marque & Direction artistique", promise: "Une identité qui justifie votre prix.", img: "/images/pole/p1-madagascar.webp" },
  { n: 2, slug: "contenu", label: "Contenu", full: "Contenu & Studio de production", promise: "Trois jours de tournage. Trois mois de contenu.", img: "/images/pole/p2-camera.webp" },
  { n: 3, slug: "acquisition", label: "Acquisition", full: "Acquisition & Réservation directe", promise: "Être trouvé à l’instant précis où l’on vous cherche.", img: "/images/pole/p3-seo.webp" },
  { n: 4, slug: "academy", label: "Academy", full: "Tropi’Com Academy · Coaching & Formation", promise: "Vos équipes deviennent autonomes. Nous restons derrière.", img: "/images/pole/p4-formation.webp" },
  { n: 5, slug: "labs", label: "Labs", full: "Tropi’Com Labs · IA & Automatisation sur mesure", promise: "Répondre à tout le monde, en quatre langues, sans jamais dormir.", img: "/images/pole/p5-robot.webp" },
];

export const expertiseHref = (slug: string) => `/expertises/${slug}`;
export const pad2 = (n: number) => String(n).padStart(2, "0");
