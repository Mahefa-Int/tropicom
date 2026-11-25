"use client";

import { EXPERTISES, pad2 } from "@/lib/expertises";
import GlowField, { type Glow } from "./GlowField";

/**
 * Page « Expertises » — haut de page (maquette 1440 × 860, sous la barre de menu).
 * Sans cadre (fond pleine largeur) ; halos CSS animés en JS : bleu ca en haut à gauche,
 * rose magenta en bas à droite (positions et tailles ajustées par calcul sur la maquette). Titre en 4 lignes (« Et Sa Réservation. » en blanc 80 %),
 * deux cartes à droite (texte, « 05 expertises »), encart « Le Content Sprint » relié par un trait,
 * les 5 pôles, et « EXPERTISES » en très grand (dégradé bleu ca → blanc).
 * À VENIR : image du Content Sprint.
 */
const GLOWS: Glow[] = [
  { x: -103, y: 44, rx: 498, ry: 549, c: "81, 206, 208", a: 1, dx: 110, dy: 90, sp: 0.5, m: 60 },
  { x: 1458, y: 919, rx: 609, ry: 672, c: "222, 11, 125", a: 1, dx: 130, dy: 90, sp: 0.42, ph: 2, m: -60 },
  { x: 1419, y: 863, rx: 401, ry: 483, c: "222, 11, 125", a: 1, dx: 110, dy: 110, sp: 0.6, ph: 4, m: -45 },
];

const POLES = EXPERTISES.map((e) => ({ n: pad2(e.n), label: e.label, slug: e.slug }));

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  );
}

export default function ExpertisesHero() {
  return (
    <section className="exh" data-reveal aria-labelledby="exh-title">
      <div className="exh-frame">
        {/* halos ajustés sur la maquette, animés en JS : dérive en boucle, respiration, suivi de la souris */}
        <GlowField glows={GLOWS} breath={0.6} />

        <h1 className="exh-title" id="exh-title">
          <span className="exh-l">Tout Ce Qui Se Passe</span>
          <span className="exh-l">Entre Le Rêve D’un</span>
          <span className="exh-l">
            Voyageur <em>Et Sa</em>
          </span>
          <span className="exh-l">
            <em>Réservation.</em>
          </span>
        </h1>

        <p className="exh-card exh-intro">
          Un voyageur haut de gamme met plusieurs semaines{" "}
          <br />
          à choisir. Il découvre, compare, doute, lit les avis,{" "}
          <br />
          revient. Nos cinq expertises couvrent chacune de ces{" "}
          <br />
          étapes, et se renforcent entre elles.
        </p>

        <div className="exh-card exh-count">
          <p className="exh-num">
            05 <span>expertises</span>
          </p>
          <span className="exh-dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <a className="exh-more" href="#pole-01">
            Découvrir
          </a>
        </div>

        <span className="exh-link" aria-hidden="true"></span>
        <article className="exh-sprint">
          <span className="exh-sprint-img" aria-hidden="true">
            <ImageIcon />
          </span>
          <div>
            <h2>Le Content Sprint</h2>
            <p>
              Trois jours de tournage. Trois mois de{" "}
              <br />
              contenu.
            </p>
            <a href="#pole-02">Voir le pôle 02</a>
          </div>
        </article>

        <ul className="exh-poles" id="poles">
          {POLES.map((p) => (
            <li key={p.n}>
              <a href={`#pole-${p.n}`}>
                <span>Pôle {p.n}</span>
                <span>{p.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <p className="exh-big" aria-hidden="true">
          EXPERTISES
        </p>
      </div>
    </section>
  );
}
