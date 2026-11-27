"use client";

import { useState } from "react";
import ImgStack, { type StackPose } from "./ui/image-stack";

/**
 * Page « Expertises » — « Pour qui » + phrase géante derrière les cartes (maquette 1440 × 872).
 * Bandeau #171616 (1328 × 156 à (56, 48)) : « Pour qui » et 4 pastilles noires cerclées.
 * Phrase « Il découvre, compare, doute, revient. » en DM Sans 550, 131 / 129, -8,5 % :
 * « Il découvre, » et « revient. » en gris #707070, « compare, » et « doute, » en blanc.
 * Cartes : pile d'images (components/ui/image-stack) placée comme sur la maquette : carte de devant 252 × 328
 * penchée de -6,9°, la suivante décalée de (+45, -15) et penchée de +6°. On tire la carte de devant,
 * ou on utilise les flèches / les points. Images provisoires (1 tirée de la maquette + 4 du site).
 */
const IMAGES = [
  "/images/expertises/carte-1.webp",
  "/images/cas/grand-hotel-diego.webp",
  "/images/cas/echoes-of-the-forest.webp",
  "/images/cas/calumma-travel-madagascar.webp",
  "/images/carriere/tournage.webp",
];

// position de chaque rang (0 = devant), relevée sur la maquette ; les cartes au-delà de la 2e attendent, cachées, derrière
const pose = (rank: number): StackPose =>
  rank === 0 ? { x: 0, y: 0, rotate: -6.9, opacity: 1 } : { x: "17.9%", y: "-4.5%", rotate: 6, opacity: rank === 1 ? 1 : 0 };
const TARGETS = [
  "Groupes hôteliers, hôtels, lodges, camps et resorts",
  "Tour-opérateurs réceptifs, DMC et agences de voyage sur mesure",
  "Destinations, offices de tourisme et événements professionnels",
  "Tables gastronomiques et lieux d’exception",
];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M14.5 6 8.5 12l6 6" : "M9.5 6l6 6-6 6"} />
    </svg>
  );
}

export default function ExpertisesFor() {
  const [order, setOrder] = useState(() => IMAGES.map((_, i) => i));
  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const prev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  const goTo = (i: number) => setOrder((o) => [...o.slice(o.indexOf(i)), ...o.slice(0, o.indexOf(i))]);
  const cur = order[0];

  return (
    <section className="exf" data-reveal aria-labelledby="exf-title">
      <div className="exf-bar">
        <h2 className="exf-title" id="exf-title">
          Pour qui
        </h2>
        <ul className="exf-pills">
          {TARGETS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <p className="exf-phrase">
        <span className="exf-line exf-line--1">
          <span className="exf-muted">Il découvre,</span> compare,
        </span>
        <span className="exf-line exf-line--2">
          doute, <span className="exf-muted">revient.</span>
        </span>
      </p>

      <ImgStack images={IMAGES} order={order} onNext={next} layout={pose} className="exf-cards" cardClassName="exf-card" />

      <div className="exf-nav">
        <button type="button" className="exf-btn exf-btn--prev" onClick={prev} aria-label="Image précédente">
          <Chevron dir="left" />
        </button>
        <span className="exf-dots">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === cur ? "is-on" : undefined}
              onClick={() => goTo(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === cur ? "true" : undefined}
            />
          ))}
        </span>
        <button type="button" className="exf-btn exf-btn--next" onClick={next} aria-label="Image suivante">
          <Chevron dir="right" />
        </button>
      </div>
    </section>
  );
}
