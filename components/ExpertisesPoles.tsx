"use client";

import { useEffect, useRef } from "react";
import GlowField, { type Glow } from "./GlowField";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Expertises » — les 5 pôles (maquettes 1440 de large, une carte #171616 par pôle, 16 px des bords).
 * Positions relevées sur les maquettes, dans le repère de la page (x de 0 à 1440, y depuis le haut de la carte) :
 * chaque élément placé reçoit --x / --y (et --w / --h) ; les textes sont placés par leur ligne de base (fonction tb).
 * Styles : titres DM Sans 600 48 / 46 -7 % ; textes 20 / 30 ; petits textes 12 ; tout en taille optique 14, -5 %.
 * Ancres : #pole-01 … #pole-05 (liens du haut de page, « Voir le pôle 02 ») : défilement animé + mise en avant de la carte.
 */

/** haut de la boîte d'une ligne de texte, à partir de sa ligne de base (DM Sans : ascendante 0,992, hauteur 1,302) */
const tb = (base: number, f: number, l: number) => +(base - (l - 1.302 * f) / 2 - 0.992 * f).toFixed(2);

type P = { x: number; y: number; w?: number; h?: number };
const at = ({ x, y, w, h }: P): React.CSSProperties =>
  ({ "--x": x, "--y": y, ...(w !== undefined && { "--w": w }), ...(h !== undefined && { "--h": h }) }) as React.CSSProperties;

function Img({ src, shape, p, gray }: { src: string; shape: "arch" | "leaf"; p: P; gray?: boolean }) {
  return (
    <span className={`pl-a pl-img pl-img--${shape}${gray ? " pl-img--gray" : ""}`} style={at({ ...p, w: 320, h: shape === "arch" ? 400 : 320 })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
    </span>
  );
}

function Head({ n, label, base, x }: { n: string; label: string; base: number; x: number }) {
  // « #0n » 32 px jaune + catégorie 16 px, alignés sur la même ligne de base
  return (
    <p className="pl-a pl-head" style={at({ x, y: tb(base, 32, 32) })}>
      <span className="pl-num">#{n}</span>
      <span className="pl-cat">{label}</span>
    </p>
  );
}

function Title({ base, x, children }: { base: number; x: number; children: React.ReactNode }) {
  return (
    <h2 className="pl-a pl-title" style={at({ x, y: tb(base, 48, 46) })}>
      {children}
    </h2>
  );
}

function Para({ base, x, lines }: { base: number; x: number; lines: string[] }) {
  return (
    <p className="pl-a pl-para" style={at({ x, y: tb(base, 20, 30) })}>
      {lines.map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 && " "}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

function Tag({ x, base, children }: { x: number; base: number; children: React.ReactNode }) {
  return (
    <p className="pl-a pl-tag" style={at({ x, y: tb(base, 12, 12) })}>
      <i />
      {children}
    </p>
  );
}

const Big = ({ n, x }: { n: string; x: number }) => (
  <span className="pl-a pl-big" style={at({ x, y: -17 })} aria-hidden="true">
    {n}
  </span>
);
const Block = ({ x, y, tone }: { x: number; y: number; tone: "yellow" | "teal" }) => (
  <span className={`pl-a pl-block pl-block--${tone}`} style={at({ x, y })} aria-hidden="true" />
);
const Badge = ({ x, y, children }: { x: number; y: number; children: React.ReactNode }) => (
  <span className="pl-a pl-badge" style={at({ x, y })}>
    <span>{children}</span>
  </span>
);

/** grille des livrables (pôles 01 et 03) : 3 colonnes de 410, rangées de 127 à partir de y 527,5 */
function Deliverables({ items }: { items: [string, string][] }) {
  return (
    <ol className="pl-a pl-grid" style={at({ x: 72, y: 527.5 })}>
      {items.map(([t, d], i) => (
        <li key={t}>
          <span className="pl-gn">{String(i + 1).padStart(2, "0")}</span>
          <b>{t}</b>
          <span className="pl-gd">{d}</span>
        </li>
      ))}
    </ol>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}

const GLOW_01: Glow[] = [{ x: 1440, y: 1022, rx: 470, ry: 520, c: "247, 194, 39", a: 0.42, dx: 60, dy: 50, sp: 0.35, m: -30 }];
const GLOW_03: Glow[] = [{ x: 1440, y: 1153, rx: 620, ry: 520, c: "62, 157, 158", a: 0.32, dx: 60, dy: 50, sp: 0.35, m: -30 }];

/* ---------------------------------------------------------------- les 5 cartes */

function Pole01() {
  return (
    <article className="pl" id="pole-01" style={{ "--ph": 1022 } as React.CSSProperties} aria-labelledby="pole-01-t">
      <GlowField glows={GLOW_01} breath={0.5} />
      <Big n="01" x={390.5} />
      <Block x={72} y={138.5} tone="yellow" />
      <Head n="01" label="Marque & Direction artistique" base={231} x={72} />
      <Title base={293} x={72}>
        <span id="pole-01-t">
          Une identité qui justifie votre <br />
          prix.
        </span>
      </Title>
      <Para
        base={388}
        x={72}
        lines={[
          "Un voyageur décide de votre gamme avant d’avoir vu vos tarifs. Une",
          "marque nette, cohérente et tenue sur tous les points de contact vaut",
          "plusieurs dizaines d’euros de plus par nuit, et rend la remise inutile.",
        ]}
      />
      <Img src="/images/pole/p1-madagascar.webp" shape="arch" p={{ x: 712, y: 55.5 }} />
      <Img src="/images/pole/p1-grotte.webp" shape="leaf" p={{ x: 1048, y: 135.5 }} />
      <Tag x={72} base={508}>
        Livrables
      </Tag>
      <Deliverables
        items={[
          ["Plateforme de marque", "Positionnement, promesse, personnalité, territoire de discours"],
          ["Identité visuelle", "Logo, palette, typographies, système graphique, iconographie"],
          ["Charte et brand book", "Y compris pour un groupe multi-établissements"],
          ["Nommage", "D’établissement, de restaurant, de spa, de collection"],
          ["Déclinaisons", "Éditions print, room directory, menus, signalétique, papeterie, uniformes"],
          ["Direction artistique", "Photo et vidéo"],
        ]}
      />
      <div className="pl-a pl-proof" style={at({ x: 72, y: 821.5, w: 1296, h: 144 })}>
        <span className="pl-ba pl-ba--before">Avant</span>
        <span className="pl-ba pl-ba--after">Après</span>
        <p className="pl-proof-tag">
          <i />
          Preuve
        </p>
        <p className="pl-proof-q">« Avant / après » sur un établissement réel, avec l’effet sur le prix moyen ou la perception.</p>
        <span className="pl-todo">[À documenter]</span>
      </div>
    </article>
  );
}

function Pole02() {
  const stats: [string, string][] = [
    ["300+", "photos retouchées"],
    ["1", "film de marque"],
    ["20", "formats verticaux"],
    ["1", "banque d’assets classée"],
  ];
  return (
    <article className="pl" id="pole-02" style={{ "--ph": 920 } as React.CSSProperties} aria-labelledby="pole-02-t">
      <Big n="02" x={1010.5} />
      <Img src="/images/pole/p2-clap.webp" shape="leaf" p={{ x: 72, y: 136 }} gray />
      <Img src="/images/pole/p2-camera.webp" shape="arch" p={{ x: 408, y: 56 }} />
      <Badge x={31} y={87}>
        <b>300+</b>
        <small>photos par sprint</small>
      </Badge>
      <Block x={768} y={108.5} tone="yellow" />
      <Head n="02" label="Contenu & Studio de production" base={201} x={768} />
      <Title base={263} x={768}>
        <span id="pole-02-t">
          Trois jours de tournage. <em>Trois</em> <br />
          <em>mois de contenu.</em>
        </span>
      </Title>
      <Para
        base={358}
        x={768}
        lines={[
          "Le contenu est votre vitrine, votre argumentaire et votre preuve sociale à",
          "la fois. Nous venons chez vous avec une équipe complète et un plan de",
          "tournage précis, et nous repartons avec de quoi alimenter tous vos",
          "canaux pendant un trimestre.",
        ]}
      />
      <div className="pl-a pl-sprint" style={at({ x: 72, y: 495.5, w: 1296, h: 368 })}>
        <h3 className="pl-sprint-t">
          LE CONTENT <br />
          SPRINT
        </h3>
        <p className="pl-sprint-p">
          Deux à quatre jours sur site. Un plan de tournage validé en amont, <br />
          un shot list par canal, une équipe photo-vidéo-drone.
        </p>
        <p className="pl-sprint-l">Livraison sous quinze jours</p>
        <ul className="pl-stats">
          {stats.map(([n, l]) => (
            <li key={l}>
              <b>{n}</b>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Pole03() {
  const pills = [
    "Part de la réservation directe",
    "Coût par réservation directe",
    "Valeur moyenne de réservation",
    "Taux de conversion du site",
    "Position sur les requêtes destination",
    "Taux d’ouverture et de clic",
    "Retour sur investissement publicitaire",
  ];
  return (
    <article className="pl" id="pole-03" style={{ "--ph": 1153 } as React.CSSProperties} aria-labelledby="pole-03-t">
      <GlowField glows={GLOW_03} breath={0.5} />
      <Big n="03" x={302.5} />
      <Block x={72} y={108.5} tone="teal" />
      <Head n="03" label="Acquisition & Réservation directe" base={201} x={72} />
      <Title base={263} x={72}>
        <span id="pole-03-t">
          Être trouvé à l’instant précis <br />
          <em>où l’on vous cherche.</em>
        </span>
      </Title>
      <Para
        base={358}
        x={72}
        lines={[
          "Le trafic n’est pas un objectif. La réservation directe en est un. Nous",
          "alignons votre site, votre référencement, vos campagnes et vos e-mails",
          "sur un seul indicateur : le coût d’acquisition d’une réservation en direct,",
          "comparé à la commission que vous versez aujourd’hui.",
        ]}
      />
      <Img src="/images/pole/p3-cube.webp" shape="arch" p={{ x: 712, y: 56 }} />
      <Img src="/images/pole/p3-seo.webp" shape="leaf" p={{ x: 1048, y: 136 }} />
      <Tag x={72} base={508}>
        Livrables
      </Tag>
      <Deliverables
        items={[
          ["Site & conversion", "Création ou refonte, pages destination, tunnel de réservation, intégration du moteur, vitesse, mobile, multilingue"],
          ["SEO", "Architecture, contenus de destination, fiches expériences, netlinking local, données structurées hôtel"],
          ["GEO / visibilité IA", "Être cité par ChatGPT, Gemini et Perplexity quand un voyageur demande « meilleur lodge à Nosy Be »"],
          ["Google Ads, Hotel Ads & méta-moteurs", "Marque défendue, conquête sur destination, remarketing"],
          ["Réseaux sociaux", "Stratégie, ligne éditoriale, production, publication, community management, social ads"],
          ["E-mailing & CRM", "Séquences pré-séjour, in-stay, post-séjour, réactivation basse saison, newsletters, segmentation par marché"],
          ["Distribution & plateformes de voyage", "Fiches Google Business, Tripadvisor, plateformes de réservation, cohérence tarifaire, parité"],
        ]}
      />
      <div className="pl-a pl-ind" style={at({ x: 72, y: 948.5, w: 1296, h: 148 })}>
        <p className="pl-ind-tag">
          <i />
          Indicateurs
        </p>
        <ul className="pl-pills">
          {pills.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Pole04() {
  const mods: [string, string, string[]][] = [
    ["Réseaux sociaux", "2 jours", ["Ligne éditoriale, calendrier, formats", "verticaux, rédaction de légendes,", "community management, gestion de crise,", "publicité."]],
    ["E-mailing & base clients", "1 jour", ["Collecte conforme, segmentation, scénarios", "automatisés, rédaction d’objets, mesure."]],
    ["Création de contenu", "2 jours", ["Photo et vidéo au smartphone, cadrage,", "lumière, montage vertical, banque d’assets,", "droits à l’image."]],
    ["E-réputation", "1 jour", ["Surveillance des avis, réponse type et", "réponse difficile, sollicitation d’avis,", "traitement d’une crise, effet sur le", "classement."]],
  ];
  const formats: string[][] = [
    ["Intra-établissement, sur votre site, groupe de 4 à 12 personnes"],
    ["À distance, sessions de 2 h sur 4 à 6 semaines"],
    ["Coaching individuel du responsable communication ou de la direction (1 h par", "semaine)"],
    ["Programme groupe hôtelier : mise à niveau simultanée de plusieurs établissements"],
  ];
  return (
    <article className="pl" id="pole-04" style={{ "--ph": 1182 } as React.CSSProperties} aria-labelledby="pole-04-t">
      <Big n="04" x={980.5} />
      <Img src="/images/pole/p4-formation.webp" shape="leaf" p={{ x: 72, y: 136 }} />
      <Img src="/images/pole/p4-tablette.webp" shape="arch" p={{ x: 408, y: 56 }} />
      <Badge x={31} y={93}>
        <b>4</b>
        <small>modules</small>
      </Badge>
      <Head n="04" label="Tropi’Com Academy · Coaching & Formation" base={155} x={768} />
      <Title base={217} x={768}>
        <span id="pole-04-t">
          Vos équipes deviennent <br />
          autonomes. <em>Nous restons</em> <br />
          <em>derrière.</em>
        </span>
      </Title>
      <Para
        base={358}
        x={768}
        lines={[
          "Toutes les maisons n’ont pas besoin d’une agence à l’année. Certaines",
          "ont surtout besoin que leur responsable communication cesse",
          "d’improviser. Nous formons vos équipes sur leurs propres outils, avec",
          "vos propres contenus, sur des objectifs qui sont les vôtres.",
        ]}
      />
      <Tag x={72} base={508}>
        Quatre modules
      </Tag>
      <ul className="pl-a pl-mods" style={at({ x: 72, y: 527.5, w: 1296 })}>
        {mods.map(([t, d, lines], i) => (
          <li key={t}>
            <p className="pl-mod-h">
              <span>Module {String(i + 1).padStart(2, "0")}</span>
              <b>{d}</b>
            </p>
            <h3>{t}</h3>
            <p className="pl-mod-d">
              {lines.map((l, k) => (
                <span key={k}>
                  {l}
                  {k < lines.length - 1 && " "}
                  {k < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
      <div className="pl-a pl-list pl-list--formats" style={at({ x: 72, y: 803.5, w: 641, h: 322 })}>
        <p className="pl-list-tag">
          <i />
          Formats
        </p>
        <ul>
          {formats.map((f) => (
            <li key={f[0]}>
              <i />
              <span>
                {f.map((l, k) => (
                  <span key={k}>
                    {l}
                    {k < f.length - 1 && " "}
                    {k < f.length - 1 && <br />}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pl-a pl-incl" style={at({ x: 728.5, y: 803.5, w: 639, h: 322 })}>
        <p className="pl-incl-t">INCLUS</p>
        <p className="pl-incl-p">
          Support écrit, modèles réutilisables, calendrier éditorial <br />
          pré-rempli, grille de réponse aux avis, attestation de fin de <br />
          formation, et 30 jours d’accès à notre équipe pour vos <br />
          questions.
        </p>
      </div>
    </article>
  );
}

function Pole05() {
  const bricks: [string, string[]][] = [
    [
      "Agent conversationnel",
      [
        "Sur votre site et sur WhatsApp. Il répond aux questions de disponibilité, de transfert, de restauration",
        "et d’excursion en français, anglais, allemand et italien, qualifie la demande, et passe la main à votre",
        "équipe au bon moment. Réservé aux vraies questions : il ne bavarde pas.",
      ],
    ],
    [
      "Veille et pilotage d’e-réputation",
      [
        "Tous vos avis (Google, Tripadvisor, plateformes de réservation, réseaux) rassemblés dans un seul",
        "tableau de bord. Alerte immédiate en cas d’avis négatif, analyse des thèmes récurrents, note par",
        "service, pour que la direction sache ce qui coince avant que ça ne se voie sur la note globale.",
      ],
    ],
    [
      "Réponse assistée aux avis",
      [
        "Une proposition de réponse rédigée dans votre ton, en langue d’origine, prête à être validée en dix",
        "secondes par votre équipe. Aucune publication sans validation humaine.",
      ],
    ],
    [
      "Recommandation personnalisée",
      [
        "Avant et pendant le séjour, chaque client reçoit les suggestions qui lui correspondent (table,",
        "excursion, spa, expérience) selon son profil, sa saison et sa durée de séjour. Le canal le plus court",
        "vers l’augmentation du panier.",
      ],
    ],
  ];
  const also: string[][] = [
    ["Traduction et adaptation automatique de vos contenus vers vos marchés émetteurs"],
    ["Réponse automatisée de premier niveau aux demandes de devis des tour-", "opérateurs"],
    ["Rapport de performance mensuel généré et commenté automatiquement"],
    ["Détection des signaux faibles d’annulation et relance ciblée"],
  ];
  const rules: [string, string[]][] = [
    ["Rien ne se publie sans validation humaine.", []],
    ["Le client sait toujours à qui il parle", [" : l’agent se présente comme tel."]],
    ["Vos données restent les vôtres", [" : hébergement européen, aucune réutilisation pour", "l’entraînement de modèles tiers, conformité RGPD."]],
    ["Une reprise humaine en un clic", [", à toute heure, sur demande du client."]],
  ];
  const steps: [string, string[]][] = [
    ["01", ["Cadrage"]],
    ["02", ["Conception et connexion à vos outils"]],
    ["03", ["Phase pilote supervisée"]],
    ["04", ["Déploiement et formation des", "équipes"]],
    ["05", ["Puis amélioration continue à partir", "des vraies conversations"]],
  ];
  const lines = (ls: string[]) =>
    ls.map((l, k) => (
      <span key={k}>
        {l}
        {k < ls.length - 1 && " "}
        {k < ls.length - 1 && <br />}
      </span>
    ));
  return (
    <article className="pl" id="pole-05" style={{ "--ph": 1552 } as React.CSSProperties} aria-labelledby="pole-05-t">
      <Big n="05" x={304.5} />
      <Head n="05" label="Tropi’Com Labs · IA & Automatisation sur mesure" base={148} x={72} />
      <Title base={210} x={72}>
        <span id="pole-05-t">
          Répondre à tout le monde, en <br />
          quatre langues, <em>sans jamais</em> <br />
          <em>dormir.</em>
        </span>
      </Title>
      <Para
        base={351}
        x={72}
        lines={[
          "Dans l’hôtellerie, l’IA ne remplace personne. Elle prend en charge ce",
          "qu’aucune équipe ne peut tenir : la disponibilité permanente, les quatre",
          "langues, la réponse à chaque avis, le suivi de chaque conversation. Nous",
          "concevons ces outils sur mesure, connectés à vos systèmes, dans votre",
          "voix.",
        ]}
      />
      <Img src="/images/pole/p5-robot.webp" shape="arch" p={{ x: 712, y: 79.5 }} />
      <Img src="/images/pole/p5-ia.webp" shape="leaf" p={{ x: 1048, y: 159.5 }} />
      <Badge x={1291} y={123}>
        <b className="pl-langs">
          FR · EN <br />
          DE · IT
        </b>
      </Badge>
      <Tag x={72} base={531}>
        Quatre briques
      </Tag>
      <ul className="pl-a pl-bricks" style={at({ x: 72, y: 550.5, w: 1296 })}>
        {bricks.map(([t, d], i) => (
          <li key={t}>
            <span className="pl-gn">{String(i + 1).padStart(2, "0")}</span>
            <h3>{t}</h3>
            <p>{lines(d)}</p>
          </li>
        ))}
      </ul>
      <div className="pl-a pl-list pl-list--also" style={at({ x: 72, y: 1006.5, w: 641, h: 322 })}>
        <p className="pl-list-tag">
          <i />
          Aussi possible
        </p>
        <ul>
          {also.map((f) => (
            <li key={f[0]}>
              <i />
              <span>{lines(f)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pl-a pl-rules" style={at({ x: 728.5, y: 1006.5, w: 639, h: 322 })}>
        <p className="pl-list-tag">
          <i />
          Nos règles
        </p>
        <ul>
          {rules.map(([b, rest]) => (
            <li key={b}>
              <Check />
              <span>
                <b>{b}</b>
                {lines(rest)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Tag x={72} base={1381}>
        Mise en œuvre
      </Tag>
      <ol className="pl-a pl-steps" style={at({ x: 72, y: 1400.5, w: 1296 })}>
        {steps.map(([n, l]) => (
          <li key={n}>
            <b>{n}</b>
            <span>{lines(l)}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function ExpertisesPoles() {
  const ref = useRef<HTMLDivElement>(null);

  // apparition de chaque carte + ancres #pole-0n : défilement animé puis mise en avant de la carte visée
  useEffect(() => {
    const root = ref.current!;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".pl"));
    const reduce = prefersReducedMotion();
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    cards.forEach((c) => (reduce ? c.classList.add("in-view") : io.observe(c)));

    let raf = 0;
    const flash = (el: HTMLElement) => {
      el.classList.remove("is-target");
      void el.offsetWidth; // relance l'animation
      el.classList.add("is-target");
      el.classList.add("in-view");
    };
    const goTo = (el: HTMLElement) => {
      cancelAnimationFrame(raf);
      const nav = document.getElementById("navbar")?.offsetHeight ?? 78;
      const from = scrollY;
      const to = Math.max(0, el.getBoundingClientRect().top + scrollY - nav - 16);
      if (reduce) {
        scrollTo(0, to);
        flash(el);
        return;
      }
      const dur = Math.min(1600, 600 + Math.abs(to - from) * 0.25);
      const t0 = performance.now();
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        scrollTo(0, from + (to - from) * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else flash(el);
      };
      raf = requestAnimationFrame(step);
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#pole-"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const el = document.getElementById(a.hash.slice(1));
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", a.hash);
      goTo(el);
    };
    document.addEventListener("click", onClick);
    // arrivée directe sur /expertises#pole-0n
    if (/^#pole-0[1-5]$/.test(location.hash)) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => goTo(el), 300);
    }
    const stop = () => cancelAnimationFrame(raf);
    addEventListener("wheel", stop, { passive: true });
    addEventListener("touchstart", stop, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick);
      removeEventListener("wheel", stop);
      removeEventListener("touchstart", stop);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pls" ref={ref}>
      <Pole01 />
      <Pole02 />
      <Pole03 />
      <Pole04 />
      <Pole05 />
    </div>
  );
}
