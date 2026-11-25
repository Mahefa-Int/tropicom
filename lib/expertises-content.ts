/**
 * Contenu des pages d'expertise (/expertises/[slug]) — mêmes textes que les blocs « pôle » de la maquette Expertises,
 * rangés par rubrique. Les rubriques facultatives n'apparaissent que si elles existent pour le pôle.
 */
export type Item = { title: string; text?: string; meta?: string };
export type Stat = { value: string; label: string };

export type ExpertiseContent = {
  /** titre : morceaux en blanc puis en jaune doré ; un retour à la ligne = « \n » */
  title: { lead: string; gold: string };
  intro: string;
  images: [string, string];
  glow: string[]; // couleurs « r, g, b » des halos du haut de page
  listTitle: string;
  items: Item[];
  /** rubrique mise en avant (Content Sprint…) */
  feature?: { kicker: string; title: string; text: string; note?: string; stats: Stat[] };
  /** chiffres clés seuls (sans rubrique) */
  stats?: Stat[];
  pills?: { title: string; items: string[] };
  lists?: { title: string; items: string[]; checks?: boolean }[];
  included?: { title: string; text: string };
  steps?: { title: string; items: string[] };
};

export const CONTENT: Record<string, ExpertiseContent> = {
  marque: {
    title: { lead: "Une identité qui\njustifie ", gold: "votre prix." },
    intro:
      "Un voyageur décide de votre gamme avant d’avoir vu vos tarifs. Une marque nette, cohérente et tenue sur tous les points de contact vaut plusieurs dizaines d’euros de plus par nuit, et rend la remise inutile.",
    images: ["/images/pole/p1-madagascar.webp", "/images/pole/p1-grotte.webp"],
    glow: ["247, 194, 39", "222, 11, 125"],
    listTitle: "Ce que nous livrons",
    items: [
      { title: "Plateforme de marque", text: "Positionnement, promesse, personnalité, territoire de discours." },
      { title: "Identité visuelle", text: "Logo, palette, typographies, système graphique, iconographie." },
      { title: "Charte et brand book", text: "Y compris pour un groupe multi-établissements." },
      { title: "Nommage", text: "D’établissement, de restaurant, de spa, de collection." },
      { title: "Déclinaisons", text: "Éditions print, room directory, menus, signalétique, papeterie, uniformes." },
      { title: "Direction artistique", text: "Photo et vidéo." },
    ],
  },
  contenu: {
    title: { lead: "Trois jours de tournage.\n", gold: "Trois mois de contenu." },
    intro:
      "Le contenu est votre vitrine, votre argumentaire et votre preuve sociale à la fois. Nous venons chez vous avec une équipe complète et un plan de tournage précis, et nous repartons avec de quoi alimenter tous vos canaux pendant un trimestre.",
    images: ["/images/pole/p2-camera.webp", "/images/pole/p2-clap.webp"],
    glow: ["247, 194, 39", "62, 157, 158"],
    listTitle: "Comment ça se passe",
    items: [
      { title: "Deux à quatre jours sur site" },
      { title: "Un plan de tournage validé en amont" },
      { title: "Un shot list par canal" },
      { title: "Une équipe photo-vidéo-drone" },
      { title: "Livraison sous quinze jours" },
    ],
    feature: {
      kicker: "Le Content Sprint",
      title: "Deux à quatre jours sur site.",
      text: "Un plan de tournage validé en amont, une shot list par canal, une équipe photo-vidéo-drone.",
      note: "Livraison sous quinze jours",
      stats: [
        { value: "300+", label: "photos retouchées" },
        { value: "1", label: "film de marque" },
        { value: "20", label: "formats verticaux" },
        { value: "1", label: "banque d’assets classée" },
      ],
    },
  },
  acquisition: {
    title: { lead: "Être trouvé à l’instant précis\n", gold: "où l’on vous cherche." },
    intro:
      "Le trafic n’est pas un objectif. La réservation directe en est un. Nous alignons votre site, votre référencement, vos campagnes et vos e-mails sur un seul indicateur : le coût d’acquisition d’une réservation en direct, comparé à la commission que vous versez aujourd’hui.",
    images: ["/images/pole/p3-seo.webp", "/images/pole/p3-cube.webp"],
    glow: ["62, 157, 158", "247, 194, 39"],
    listTitle: "Ce que nous livrons",
    items: [
      { title: "Site & conversion", text: "Création ou refonte, pages destination, tunnel de réservation, intégration du moteur, vitesse, mobile, multilingue." },
      { title: "SEO", text: "Architecture, contenus de destination, fiches expériences, netlinking local, données structurées hôtel." },
      { title: "GEO / visibilité IA", text: "Être cité par ChatGPT, Gemini et Perplexity quand un voyageur demande « meilleur lodge à Nosy Be »." },
      { title: "Google Ads, Hotel Ads & méta-moteurs", text: "Marque défendue, conquête sur destination, remarketing." },
      { title: "Réseaux sociaux", text: "Stratégie, ligne éditoriale, production, publication, community management, social ads." },
      { title: "E-mailing & CRM", text: "Séquences pré-séjour, in-stay, post-séjour, réactivation basse saison, newsletters, segmentation par marché." },
      { title: "Distribution & plateformes de voyage", text: "Fiches Google Business, Tripadvisor, plateformes de réservation, cohérence tarifaire, parité." },
    ],
    pills: {
      title: "Ce que nous mesurons",
      items: [
        "Part de la réservation directe",
        "Coût par réservation directe",
        "Valeur moyenne de réservation",
        "Taux de conversion du site",
        "Position sur les requêtes destination",
        "Taux d’ouverture et de clic",
        "Retour sur investissement publicitaire",
      ],
    },
  },
  academy: {
    title: { lead: "Vos équipes deviennent autonomes.\n", gold: "Nous restons derrière." },
    intro:
      "Toutes les maisons n’ont pas besoin d’une agence à l’année. Certaines ont surtout besoin que leur responsable communication cesse d’improviser. Nous formons vos équipes sur leurs propres outils, avec vos propres contenus, sur des objectifs qui sont les vôtres.",
    images: ["/images/pole/p4-formation.webp", "/images/pole/p4-tablette.webp"],
    glow: ["247, 194, 39", "62, 157, 158"],
    listTitle: "Quatre modules",
    items: [
      { title: "Réseaux sociaux", meta: "2 jours", text: "Ligne éditoriale, calendrier, formats verticaux, rédaction de légendes, community management, gestion de crise, publicité." },
      { title: "E-mailing & base clients", meta: "1 jour", text: "Collecte conforme, segmentation, scénarios automatisés, rédaction d’objets, mesure." },
      { title: "Création de contenu", meta: "2 jours", text: "Photo et vidéo au smartphone, cadrage, lumière, montage vertical, banque d’assets, droits à l’image." },
      { title: "E-réputation", meta: "1 jour", text: "Surveillance des avis, réponse type et réponse difficile, sollicitation d’avis, traitement d’une crise, effet sur le classement." },
    ],
    lists: [
      {
        title: "Formats",
        items: [
          "Intra-établissement, sur votre site, groupe de 4 à 12 personnes",
          "À distance, sessions de 2 h sur 4 à 6 semaines",
          "Coaching individuel du responsable communication ou de la direction (1 h par semaine)",
          "Programme groupe hôtelier : mise à niveau simultanée de plusieurs établissements",
        ],
      },
    ],
    included: {
      title: "Inclus",
      text: "Support écrit, modèles réutilisables, calendrier éditorial pré-rempli, grille de réponse aux avis, attestation de fin de formation, et 30 jours d’accès à notre équipe pour vos questions.",
    },
  },
  labs: {
    title: { lead: "Répondre à tout le monde, en quatre langues,\n", gold: "sans jamais dormir." },
    intro:
      "Dans l’hôtellerie, l’IA ne remplace personne. Elle prend en charge ce qu’aucune équipe ne peut tenir : la disponibilité permanente, les quatre langues, la réponse à chaque avis, le suivi de chaque conversation. Nous concevons ces outils sur mesure, connectés à vos systèmes, dans votre voix.",
    images: ["/images/pole/p5-robot.webp", "/images/pole/p5-ia.webp"],
    glow: ["222, 11, 125", "62, 157, 158"],
    listTitle: "Quatre briques",
    items: [
      {
        title: "Agent conversationnel",
        text: "Sur votre site et sur WhatsApp. Il répond aux questions de disponibilité, de transfert, de restauration et d’excursion en français, anglais, allemand et italien, qualifie la demande, et passe la main à votre équipe au bon moment. Réservé aux vraies questions : il ne bavarde pas.",
      },
      {
        title: "Veille et pilotage d’e-réputation",
        text: "Tous vos avis (Google, Tripadvisor, plateformes de réservation, réseaux) rassemblés dans un seul tableau de bord. Alerte immédiate en cas d’avis négatif, analyse des thèmes récurrents, note par service.",
      },
      {
        title: "Réponse assistée aux avis",
        text: "Une proposition de réponse rédigée dans votre ton, en langue d’origine, prête à être validée en dix secondes par votre équipe. Aucune publication sans validation humaine.",
      },
      {
        title: "Recommandation personnalisée",
        text: "Avant et pendant le séjour, chaque client reçoit les suggestions qui lui correspondent (table, excursion, spa, expérience) selon son profil, sa saison et sa durée de séjour.",
      },
    ],
    stats: [
      { value: "4", label: "langues : français, anglais, allemand, italien" },
      { value: "24/7", label: "disponibilité, sans relâche" },
      { value: "10 s", label: "pour valider une réponse à un avis" },
    ],
    lists: [
      {
        title: "Aussi possible",
        items: [
          "Traduction et adaptation automatique de vos contenus vers vos marchés émetteurs",
          "Réponse automatisée de premier niveau aux demandes de devis des tour-opérateurs",
          "Rapport de performance mensuel généré et commenté automatiquement",
          "Détection des signaux faibles d’annulation et relance ciblée",
        ],
      },
      {
        title: "Nos règles",
        checks: true,
        items: [
          "Rien ne se publie sans validation humaine.",
          "Le client sait toujours à qui il parle : l’agent se présente comme tel.",
          "Vos données restent les vôtres : hébergement européen, aucune réutilisation pour l’entraînement de modèles tiers, conformité RGPD.",
          "Une reprise humaine en un clic, à toute heure, sur demande du client.",
        ],
      },
    ],
    steps: {
      title: "Mise en œuvre",
      items: [
        "Cadrage",
        "Conception et connexion à vos outils",
        "Phase pilote supervisée",
        "Déploiement et formation des équipes",
        "Puis amélioration continue à partir des vraies conversations",
      ],
    },
  },
};
