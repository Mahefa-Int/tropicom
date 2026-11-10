/**
 * Les 5 expertises de la section services.
 * Les valeurs de position (imgY, leadY, descY, tagsX, tagsY) sont en px de la maquette (1440),
 * dans le repère de la carte redressée (800 × 550).
 * Le « \n » dans title / desc force un retour à la ligne sur ordinateur (ignoré sur mobile).
 */
export type Service = {
  n: string;
  title: string;
  rotate: number;      // inclinaison en degrés
  accent: string;      // couleur du petit carré et des soulignements
  images: { src: string; alt: string; position?: string }[];
  lead: string;
  desc: string;
  tags: [string, string][];
  imgY: number;
  leadY: number;
  descY: number;
  tagsX: number;
  tagsY: number;
};

export const SERVICES: Service[] = [
  {
    n: "01",
    title: "Marque & Direction artistique",
    rotate: -3,
    accent: "#ffffff",
    images: [
      { src: "/images/services/01-marque-canette.jpg", alt: "Canette noire en mouvement" },
      { src: "/images/services/01-marque-papeterie.jpg", alt: "Papeterie d’hôtel dans un plateau en rotin" },
    ],
    lead: "Une identité qui justifie votre prix",
    desc: "Plateforme de marque, identité visuelle,\ncharte, nommage, éditions print,\nsignalétique, brand book multi-\nétablissements.",
    tags: [
      ["Identité visuelle", "Systèmes typographiques"],
      ["Conception de logo", "Conception d’emballage"],
      ["Positionnement de la marque", "Refonte de l’image"],
    ],
    imgY: 165, leadY: 390.5, descY: 437.2, tagsX: 380, tagsY: 418.5,
  },
  {
    n: "02",
    title: "Contenu & Studio",
    rotate: 3,
    accent: "#ffffff",
    images: [
      { src: "/images/services/02-contenu-appareil-photo.jpg", alt: "Appareil photo en tournage", position: "center 70%" },
      { src: "/images/services/02-contenu-clap.jpg", alt: "Clap de cinéma" },
    ],
    lead: "Trois jours de tournage. Trois mois de contenu",
    desc: "Photo, vidéo, drone, format vertical, visites immersives,\nUGC et créateurs, rédaction FR/EN, calendrier éditorial.",
    tags: [
      ["Création de contenu", "Drone"],
      ["Photo & Vidéo", "SEO"],
      ["UGC", "Production audiovisuelle"],
    ],
    imgY: 165, leadY: 430.5, descY: 478.2, tagsX: 481, tagsY: 418.5,
  },
  {
    n: "03",
    title: "Academy -Coaching &\nFormation",
    rotate: -3,
    accent: "var(--rose-magenta)",
    images: [
      { src: "/images/services/03-academy-bloc-notes.jpg", alt: "Prise de notes sur un bloc-notes" },
      { src: "/images/services/03-academy-formation.jpg", alt: "Formation en ligne" },
    ],
    lead: "Vos équipes deviennent autonomes",
    desc: "Réseaux sociaux, e-mailing, création de\ncontenu, e-réputation. En présentiel sur\nvotre site ou à distance, avec certification\ninterne.",
    tags: [
      ["Académie", "Coaching"],
      ["Formation", "DéveloppementDesCompétence"],
      ["Mentorat", "Refonte de l’image"],
    ],
    imgY: 193, leadY: 394.5, descY: 442.2, tagsX: 404, tagsY: 422.5,
  },
  {
    n: "04",
    title: "Acquisition & Réservation\ndirecte",
    rotate: 3,
    accent: "#c9a227",
    images: [
      { src: "/images/services/04-acquisition-indicateur-3d.jpg", alt: "Indicateur de performance en 3D" },
      { src: "/images/services/04-acquisition-seo.jpg", alt: "Lettres SEO" },
    ],
    lead: "Être trouvé à l’instant précis où l’on vous cherche",
    desc: "Site et moteur de réservation, SEO, GEO (IA génératives),\nGoogle Ads & Hotel Ads, méta-moteurs, réseaux sociaux, e-\nmailing, distribution et plateformes de voyage.",
    tags: [
      ["Référencement", "Moteur de réservation"],
      ["Acquisition de clients", "SEO"],
      ["Conversion", "Référencement local"],
    ],
    imgY: 193, leadY: 411, descY: 457.2, tagsX: 471, tagsY: 418.5,
  },
  {
    n: "05",
    title: "Labs - IA & Automatisation",
    rotate: -3,
    accent: "var(--jaune-dore)",
    images: [
      { src: "/images/services/05-labs-robot.jpg", alt: "Robot qui écrit sur un clavier", position: "center 62%" },
      { src: "/images/services/05-labs-main-ia.jpg", alt: "Main robotique et main humaine autour des lettres AI" },
    ],
    lead: "Répondre à tout le monde, en quatre langues, en continu",
    desc: "Agent conversationnel sur votre site et WhatsApp, veille et pilotage d’e-\nréputation, réponse assistée aux avis, recommandation personnalisée\npendant le séjour.",
    tags: [
      ["IA conversationnelle", "Automatisation"],
      ["Chatbots", "WhatsApp"],
      ["Personnalisation", "Expérience client"],
    ],
    imgY: 165, leadY: 413, descY: 459.2, tagsX: 512, tagsY: 418.5,
  },
];
