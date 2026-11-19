/**
 * Ajoute les études de cas de départ (contenu des maquettes) si elles n'existent pas encore.
 *   npm run db:seed-cas
 * Ne modifie jamais une réalisation existante (même adresse) : à relancer sans risque.
 * Images des cartes : /images/realisations/cartes/ (extraites de la maquette, à remplacer par les originaux).
 * Lit DATABASE_URL dans l'environnement, sinon dans .env.local.
 */
import { readFileSync, existsSync } from "node:fs";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const CASES = [
  {
    slug: "grand-hotel-diego",
    client: "Grand Hôtel Diego",
    sector: "Hôtels & lodges",
    location: "Antsiranana, Madagascar",
    coverUrl: "/images/cas/grand-hotel-diego/hero.webp",
    status: "published",
    sortOrder: 1,
    details: {
      titleLead: "Grand Hôtel Diego :",
      titleRest: "reprendre la main sur la\nréservation directe.",
      meta: [
        { label: "Client", value: "Hôtel haut de gamme" },
        { label: "Territoire", value: "Antsiranana, Madagascar" },
        { label: "Expertises", value: "Marque · Contenu · Acquisition" },
        { label: "Période", value: "Résultats · août 2026" },
      ],
      hero: {
        alt: "Façade du Grand Hôtel Diego, fenêtres en arc et cocotier",
        caption: "Photo · façade et piscine du Grand Hôtel Diego, golden hour",
        stat: "8,8 %",
        statText: "d’engagement · vidéo piscine du 23 août",
      },
      thumb: "/images/realisations/cartes/grand-hotel-diego.webp",
      context:
        "Un hôtel haut de gamme au cœur d’Antsiranana, dans le nord de\nMadagascar. Chambres, suites, piscine, restaurant et bien-être, pour une\nclientèle locale et internationale.",
      stake: "Moderniser l’image et renforcer la présence digitale,\npour que la communication traduise enfin le standing\nde l’hôtel.",
      answerLead: "Une même logique :",
      answerHighlight: "reconstruire une présence digitale cohérente, de l’image jusqu’au parcours en\nligne.",
      levers: [
        { title: "Repositionner l’identité visuelle", text: "Audit de l’existant, nouvelle direction artistique, logo, couleurs et\ntypographies modernisés." },
        { title: "Créer une bibliothèque de contenus", text: "Shooting professionnel : photos HD, vidéo de présentation et formats\ncourts." },
        { title: "Structurer les réseaux sociaux", text: "Des contenus organisés autour des services, des offres et de la vie de\nl’hôtel." },
        { title: "Un nouveau point de contact digital", text: "Un site bilingue pensé pour guider le visiteur jusqu’à la réservation." },
      ],
      gallery: [
        { src: "/images/cas/grand-hotel-diego/visuel-1.webp", alt: "Publications réseaux sociaux et kakémonos du Grand Hôtel Diego", w: 2624, h: 773 },
        { src: "/images/cas/grand-hotel-diego/visuel-2.webp", alt: "Affiche « Le Grand Hôtel Diego, hôtel 4 étoiles au cœur d’Antsiranana »", w: 2624, h: 1968 },
        { src: "/images/cas/grand-hotel-diego/visuel-3.webp", alt: "Le nouveau site du Grand Hôtel Diego sur ordinateur, portable et tablette", w: 2624, h: 1749 },
      ],
      resultsTitle: "Ce que ça a produit.",
      resultsNote: "Réseaux sociaux · août 2026",
      results: [
        { value: "635", label: "clics vers le site", note: "Réseaux sociaux · août 2026" },
        { value: "6,5 %", label: "d’engagement sur les vidéos", note: "contre 3,6 % sur les photos" },
        { value: "693", label: "réactions et 86 commentaires", note: "sur les contenus publiés" },
      ],
      highlight: { strong: "La vidéo piscine du 23 août atteint 8,8 % d’engagement", text: ": les formats courts et immersifs font la différence." },
      quote: { text: "[Verbatim à récupérer auprès de la direction]", name: "Daniel Lozes", role: "[Fonction] · Grand Hôtel Diego", avatar: "" },
      nextId: null,
      seoTitle: "Grand Hôtel Diego : reprendre la main sur la réservation directe",
      seoDescription:
        "Étude de cas : identité visuelle, bibliothèque de contenus, réseaux sociaux et site bilingue pour un hôtel haut de gamme d’Antsiranana, Madagascar.",
    },
  },
  // réalisations de la maquette « Nos réalisations » : carte complète, contenu de la page à rédiger dans l'admin
  ...[
    ["calumma-travel", "Calumma Travel", "Tour-opérateur", "Madagascar", "structurer le parcours digital.", "Marque · Acquisition · CRM", "+152,7 %", "de vues · décembre 2025", true],
    ["echoes-of-the-forest", "Echoes of the Forest", "Hôtels & lodges", "Andasibe", "une présence digitale dès le lancement.", "Marque · Contenu · Acquisition", "35 817", "comptes touchés · août 2026", true],
    ["louvre-hotel-spa", "Louvre Hotel & Spa", "Hôtels & lodges", "Madagascar", "chaque moment de l’hôtel en vidéo.", "Contenu", "+152,7 %", "de vues · décembre 2025", true],
    ["cafe-du-musee", "Café du Musée", "Restauration", "Antananarivo", "faire rayonner une adresse emblématique.", "Marque · Contenu", "1,2 M", "de vues sur Facebook", true],
    ["veezit-2025", "Veezit 2025", "Hôtels & lodges", "Madagascar", "la communication d’un salon touristique.", "Contenu", "[KPI]", "Résultat à documenter", true],
    ["globatlas-elssa", "Globatlas Elssa", "Restauration", "Antananarivo", "installer une marque premium dans l’océan Indien.", "Marque · Contenu · Acquisition · Événement", "2,2 M", "de vues cumulées · janv.–sept. 2025", true],
    ["valahara-cafe", "Valahara Café", "Restauration", "Antsirabe", "une présence à la hauteur de l’expérience.", "Marque · Acquisition", "[KPI]", "Résultat à documenter", false],
  ].map(([slug, client, sector, location, rest, expertises, stat, statText, image], i) => ({
    slug,
    client,
    sector,
    location,
    coverUrl: image ? `/images/realisations/cartes/${slug}.webp` : null,
    status: "published",
    sortOrder: i + 2,
    details: {
      titleLead: `${client} :`,
      titleRest: rest,
      meta: [{ label: "Expertises", value: expertises }],
      hero: { alt: "", caption: "", stat, statText },
    },
  })),
];

const conn = await mysql.createConnection(process.env.DATABASE_URL);
for (const c of CASES) {
  const [rows] = await conn.execute("SELECT id FROM case_studies WHERE slug = ?", [c.slug]);
  if (rows.length) {
    console.log(`déjà présente : ${c.slug}`);
    continue;
  }
  const title = `${c.details.titleLead} ${c.details.titleRest}`.replace(/\s+/g, " ").trim();
  await conn.execute(
    "INSERT INTO case_studies (title, slug, client, sector, location, cover_url, details, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, c.slug, c.client, c.sector, c.location, c.coverUrl, JSON.stringify(c.details), c.status, c.sortOrder],
  );
  console.log(`ajoutée : ${c.slug} (${c.status === "published" ? "publiée" : "brouillon"})`);
}
await conn.end();
