"use client";

import { useRef } from "react";
import { Inter } from "next/font/google";
import CtaIcon from "./CtaIcon";
import GlowField, { type Glow } from "./GlowField";

/**
 * Page « Ressources » (maquette 1440 × 2493, mise en page à partir du haut de la page, barre de menu comprise).
 * - Haut : « L'ANCIEN BLOG, CONVERTI EN MACHINE À AUTORITÉ. » (DM Sans 500 72 / 70, -6 %), texte 24 / 32,
 *   bloc bleu ca 450 × 600 (emplacement d'image) et carte « Nouvelle édition » ;
 * - trois cartes : L'Observatoire, Les Guides, Le journal ;
 * - bloc Observatoire : couverture du rapport (image), thèmes, inscription par e-mail ;
 * - « Les Guides » : 4 guides PDF (titres en Inter 700), illustrations en SVG.
 * À COMPLÉTER : image du bloc bleu, liens des PDF, envoi du formulaire (à relier au back-office).
 */
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-inter", display: "swap" });

const HUBS = [
  { title: "L’Observatoire", text: ["L’étude anuelle du digital touristique de l’Océan", "Indien."], link: "Recevoir l’étude", href: "#observatoire", side: "right" },
  { title: "Les Guides", text: ["Des méthodes actionnables, à télécharger et à", "appliquer."], link: "Voir les guides", href: "#guides", side: "left" },
  { title: "Le journal", text: ["Analyses courtes, décryptages d’algorithmes retours", "de terrain."], link: "Lire le journal", href: "#", side: "left" },
] as const;

/** halo du bloc Observatoire (repère du bloc : 1312 × 579) : magenta en bas à gauche, prune sous les thèmes */
const OBS_GLOWS: Glow[] = [
  { x: 300, y: 540, rx: 460, ry: 210, rot: -22, c: "222, 11, 125", a: 0.7, dx: 90, dy: 40, sp: 0.35, ph: 0, m: 40 },
  { x: 560, y: 450, rx: 320, ry: 170, rot: -18, c: "150, 8, 85", a: 0.55, dx: 120, dy: 50, sp: 0.28, ph: 2.1, m: 60 },
  { x: 820, y: 500, rx: 300, ry: 130, rot: -10, c: "120, 10, 70", a: 0.4, dx: 140, dy: 35, sp: 0.22, ph: 4.2, m: 30 },
];

const TOPICS = ["Marchés émetteurs et saisonnalité", "Réservation directe et plateformes", "Réseaux sociaux et formats qui performent", "IA, recherche et nouvelle visibilité"];

type Guide = { n: string; title: string[]; text: string[]; tone: "gold" | "dark" | "teal"; art: "rings" | "waves" | "spike" | "pin" };
const GUIDES: Guide[] = [
  { n: "01", title: ["Répondre aux", "avis clients"], text: ["Le ton, la structure et les délais", "pour transformer un avis en", "preuve de sérieux."], tone: "gold", art: "rings" },
  { n: "02", title: ["Réduire sa", "dépendance", "aux", "plateformes"], text: ["Reprendre la main sur ses", "réservations sans couper les", "canaux qui remplissent."], tone: "dark", art: "waves" },
  { n: "03", title: ["Préparer un", "Content Sprint"], text: ["Produire en quelques jours les", "contenus d’une saison entière,", "sans s’épuiser."], tone: "teal", art: "spike" },
  { n: "04", title: ["Rédiger une", "fiche", "destination"], text: ["La structure d’une fiche qui", "informe, rassure et donne envie", "de réserver."], tone: "dark", art: "pin" },
];

function lines(ls: readonly string[]) {
  return ls.map((l, i) => (
    <span key={i}>
      {l}
      {i < ls.length - 1 && " "}
      {i < ls.length - 1 && <br />}
    </span>
  ));
}

/** illustrations des guides (repère de la carte : 224 de large) */
function Art({ kind }: { kind: Guide["art"] }) {
  if (kind === "rings")
    return (
      <svg className="rs-art rs-art--rings" viewBox="0 0 224 298" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
        <path d="M118 298 A110 110 0 0 1 224 176" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M146 298 A80 80 0 0 1 224 205" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="200" cy="262" r="26" fill="#fff" />
      </svg>
    );
  if (kind === "waves")
    return (
      <svg className="rs-art rs-art--waves" viewBox="0 0 224 325" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
        {[
          [203, "#f7c227"],
          [233, "#f7c227"],
          [263, "#fff"],
        ].map(([y, c]) => (
          <path key={y as number} d={`M25 ${y} C70 ${(y as number) - 14} 100 ${(y as number) + 14} 145 ${y} S205 ${(y as number) - 8} 224 ${(y as number) + 6}`} fill="none" stroke={c as string} strokeWidth="2.4" />
        ))}
      </svg>
    );
  if (kind === "spike")
    return (
      <svg className="rs-art rs-art--spike" viewBox="0 0 224 298" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
        <path d="M222 188 C220 230 210 262 166 262 C204 270 216 282 224 296 Z" fill="#fff" />
      </svg>
    );
  return (
    <svg className="rs-art rs-art--pin" viewBox="0 0 224 325" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <path d="M178 193 C203 193 222 212 222 237 C222 266 196 290 178 313 C160 290 134 266 134 237 C134 212 153 193 178 193 Z" fill="#de0b7d" />
      <circle cx="178" cy="235" r="16" fill="#fff" />
    </svg>
  );
}

export default function Resources() {
  const coverRef = useRef<HTMLDivElement>(null);

  // couverture du rapport : légère inclinaison 3D qui suit la souris
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    coverRef.current?.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    coverRef.current?.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  };
  const onLeave = () => {
    coverRef.current?.style.setProperty("--rx", "0deg");
    coverRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={`rs ${inter.variable}`}>
      {/* ---------- haut de page ---------- */}
      <section className="rs-hero" data-reveal aria-labelledby="rs-title">
        <h1 className="rs-title" id="rs-title">
          <span className="rs-l">
            <span>L’ANCIEN BLOG,</span>
          </span>
          <span className="rs-l">
            <span>CONVERTI EN MACHINE À</span>
          </span>
          <span className="rs-l">
            <span>AUTORITÉ.</span>
          </span>
        </h1>
        <p className="rs-lead">
          Études, guides pratiques et analyses pour les professionnels du tourisme de <br />
          l’Océan Indien. Écrits par des gens qui gèrent ces sujets tous les jours, pour <br />
          des gens qui doivent décider cette semaine.
        </p>
        <span className="rs-visual" aria-hidden="true" />
        <a href="#observatoire" className="rs-edition">
          <span className="rs-pill">Nouvelle édition</span>
          <span className="rs-edition-t">
            L’Observatoire <br />
            2026 du digital <br />
            touristique
          </span>
          <i className="rs-minus" aria-hidden="true" />
        </a>
      </section>

      {/* ---------- trois entrées ---------- */}
      <ul className="rs-hubs" data-reveal>
        {HUBS.map((h) => (
          <li key={h.title} className={`rs-hub rs-hub--${h.side}`}>
            <h2>{h.title}</h2>
            <p>{lines(h.text)}</p>
            <a href={h.href}>{h.link}</a>
            <i aria-hidden="true" />
          </li>
        ))}
      </ul>

      {/* ---------- Observatoire ---------- */}
      <section className="rs-obs" id="observatoire" data-reveal aria-labelledby="rs-obs-t">
        <GlowField className="rs-obs-glow" glows={OBS_GLOWS} breath={0.7} />
        <div className="rs-cover-zone" onPointerMove={onMove} onPointerLeave={onLeave}>
          <div className="rs-cover" ref={coverRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ressources/observatoire-couverture.webp" alt="Couverture de l’Observatoire 2026 du digital touristique — Océan Indien" width={414} height={508} />
          </div>
        </div>
        <p className="rs-obs-label">L’Observatoire</p>
        <h2 className="rs-obs-t" id="rs-obs-t">
          L’étude annuelle du digital <br />
          touristique de l’Océan Indien.
        </h2>
        <p className="rs-obs-text">
          Notre pièce de référence. Comment les voyageurs <br />
          cherchent, comparent et réservent dans la région, et ce <br />
          que les établissements font réellement de leur présence <br />
          en ligne.
        </p>
        <ul className="rs-topics">
          {TOPICS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <form className="rs-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="rs-mail">E-mail professionnel</label>
          <input id="rs-mail" type="email" placeholder="prenoms@votre-hotel.com" required />
          <button type="submit" className="cta rs-cta">
            <CtaIcon />
            <span className="cta-label">Recevoir l’étude</span>
          </button>
        </form>
      </section>

      {/* ---------- Les Guides ---------- */}
      <section className="rs-guides" id="guides" data-reveal aria-labelledby="rs-guides-t">
        <h2 className="rs-guides-t" id="rs-guides-t">
          Les Guides
        </h2>
        <p className="rs-guides-p">
          Des méthodes pas à pas, conçues pour être appliquées <br />
          dès cette semaine. En téléchargement libre.
        </p>
        <ol className="rs-guide-list">
          {GUIDES.map((g) => (
            <li key={g.n} className={`rs-guide rs-guide--${g.tone}${g.title.length > 2 ? " is-tall" : ""}`}>
              <article className="rs-guide-card">
                <Art kind={g.art} />
                <span className="rs-guide-n">Guide {g.n}</span>
                <span className="rs-guide-pdf">PDF</span>
                <h3>{lines(g.title)}</h3>
                <span className="rs-guide-by">Guide Tropi.com</span>
              </article>
              <p className="rs-guide-text">{lines(g.text)}</p>
              <a className="rs-guide-dl" href="#">
                Télécharger le guide (PDF)
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
