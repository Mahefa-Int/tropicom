/**
 * Études de cas : contenu détaillé d'une réalisation (page /realisations/[slug]).
 * Les colonnes simples (adresse, client, photo, statut…) sont dans la table case_studies ; tout le reste
 * (textes, leviers, chiffres, verbatim…) est rangé en JSON dans la colonne « details ».
 * Fichier partagé : le formulaire de l'admin (navigateur) et la page publique (serveur) l'utilisent.
 *
 * Dans les textes, un retour à la ligne = un retour à la ligne sur ordinateur (ignoré sur mobile).
 */
import { z } from "zod";

const s = (max = 600) => z.string().max(max).catch("");
const img = z.object({ src: s(255), alt: s(255), w: z.number().int().nonnegative().optional().catch(undefined), h: z.number().int().nonnegative().optional().catch(undefined) });

export const DetailsSchema = z.object({
  titleLead: s(200),
  titleRest: s(400),
  meta: z.array(z.object({ label: s(60), value: s(160) })).max(8).catch([]),
  hero: z.object({ alt: s(255), caption: s(200), stat: s(30), statText: s(120) }).catch({ alt: "", caption: "", stat: "", statText: "" }),
  /** vignette carrée pour les listes (page Réalisations, « Projet suivant ») ; vide = photo principale */
  thumb: s(255),
  context: s(1500),
  stake: s(800),
  answerLead: s(200),
  answerHighlight: s(800),
  levers: z.array(z.object({ title: s(160), text: s(600) })).max(8).catch([]),
  gallery: z.array(img).max(12).catch([]),
  resultsTitle: s(120),
  resultsNote: s(120),
  results: z.array(z.object({ value: s(30), label: s(120), note: s(120) })).max(6).catch([]),
  highlight: z.object({ strong: s(300), text: s(300) }).catch({ strong: "", text: "" }),
  quote: z.object({ text: s(1200), name: s(120), role: s(160), avatar: s(255) }).catch({ text: "", name: "", role: "", avatar: "" }),
  nextId: z.number().int().positive().nullable().catch(null),
  seoTitle: s(200),
  seoDescription: s(300),
});
export type CaseDetails = z.infer<typeof DetailsSchema>;

/** valeurs d'une nouvelle réalisation (structure de la maquette) */
export const emptyDetails = (): CaseDetails => ({
  titleLead: "",
  titleRest: "",
  meta: [
    { label: "Client", value: "" },
    { label: "Territoire", value: "" },
    { label: "Expertises", value: "" },
    { label: "Période", value: "" },
  ],
  hero: { alt: "", caption: "", stat: "", statText: "" },
  thumb: "",
  context: "",
  stake: "",
  answerLead: "",
  answerHighlight: "",
  levers: [{ title: "", text: "" }],
  gallery: [],
  resultsTitle: "Ce que ça a produit.",
  resultsNote: "",
  results: [{ value: "", label: "", note: "" }],
  highlight: { strong: "", text: "" },
  quote: { text: "", name: "", role: "", avatar: "" },
  nextId: null,
  seoTitle: "",
  seoDescription: "",
});

/** lit la colonne JSON (tolérant : un champ abîmé ou manquant reprend sa valeur par défaut) */
export function parseDetails(raw: string | null | undefined): CaseDetails {
  let json: unknown = {};
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {}
  const base = emptyDetails();
  const r = DetailsSchema.safeParse({ ...base, ...(json as object) });
  return r.success ? r.data : base;
}

/** titre complet (liste de l'admin, onglet du navigateur) */
export const fullTitle = (d: Pick<CaseDetails, "titleLead" | "titleRest">) =>
  [d.titleLead, d.titleRest].join(" ").replace(/\s+/g, " ").trim();

/** données prêtes pour la page (composant CaseStudy) */
export type CaseData = {
  name: string;
  details: CaseDetails;
  heroSrc: string | null;
  next: { href: string; client: string; title: string; tags: string; stat: string; statText: string; image: string } | null;
};

/** carte d'une réalisation (page Réalisations et « Projet suivant ») : construite à partir de son contenu, sans saisie en double */
export type CaseCard = { href: string; client: string; title: string; tags: string; stat: string; statText: string; image: string; pill: string; sector: string; location: string };

export function caseCard(
  row: { slug: string; client: string | null; title: string; coverUrl: string | null; sector: string | null; location: string | null },
  d: CaseDetails,
): CaseCard {
  const promise = d.titleRest.replace(/\s+/g, " ").trim().replace(/[.:;,!]+$/, "");
  const title = promise ? promise.charAt(0).toUpperCase() + promise.slice(1) : fullTitle(d) || row.title;
  const tags = d.meta.find((m) => /expertise/i.test(m.label))?.value || "";
  return {
    href: `/realisations/${row.slug}`,
    client: row.client || "",
    title,
    tags,
    stat: d.hero.stat,
    statText: d.hero.statText,
    image: d.thumb || row.coverUrl || "",
    pill: [row.sector, row.location].filter(Boolean).join(" · "),
    sector: row.sector || "",
    location: row.location || "",
  };
}

/** carte « Projet suivant » (même contenu que la carte de la page Réalisations) */
export const nextCard = caseCard;
