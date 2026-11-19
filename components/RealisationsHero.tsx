"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Nos réalisations » — haut de page (maquette 1440 × 554, fond #171616, sous la barre de menu).
 * Étiquette 12 px ; titre DM Sans 600 72 / 64, -7 % (fin en jaune doré) ; texte 20 / 30 ;
 * trois cartes penchées (150 × 195, bord noir, coins 22) : rapport d'activité (+10°), Echoes of the Forest (-1°),
 * Journeys with Lorraine (-12°, coupée par le bord droit) ; pastille jaune « 08 études de cas » (nombre de réalisations publiées) ;
 * étapes « 01 Situation — 02 Réponse — 03 Résultats » (la dernière en jaune).
 * Images : /images/realisations/*.webp (fournies).
 */
const CARDS: { src: string; cx: number; cy: number; rot: number; pos: string; zoom?: number; origin?: string; alt: string }[] = [
  { src: "/images/realisations/rapport-activite.webp", cx: 1138, cy: 150, rot: 10, pos: "86% 50%", zoom: 1.6, origin: "66% 60%", alt: "Rapport d'activité 2026" },
  { src: "/images/realisations/echoes-of-the-forest.webp", cx: 1253, cy: 129, rot: -1, pos: "76% 28%", zoom: 1.25, origin: "88% 30%", alt: "Echoes of the Forest : site et identité" },
  { src: "/images/realisations/journeys-with-lorraine.webp", cx: 1359, cy: 171, rot: -12, pos: "42% 45%", alt: "Journeys with Lorraine : identité de marque" },
];
const STEPS = ["Situation", "Réponse", "Résultats"];

export default function RealisationsHero({ count = 8 }: { count?: number }) {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current!;
    const t = setTimeout(() => sec.classList.add("in-view"), 60);
    if (prefersReducedMotion()) return () => clearTimeout(t);
    // les cartes suivent légèrement la souris (chacune à sa profondeur)
    const cards = Array.from(sec.querySelectorAll<HTMLElement>(".rlh-card"));
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      cards.forEach((c, i) => c.style.setProperty("--m", `${(mx * (6 + i * 4)).toFixed(1)}px ${(my * (4 + i * 3)).toFixed(1)}px`));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    sec.addEventListener("pointermove", onMove);
    return () => {
      clearTimeout(t);
      sec.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="rlh" ref={secRef} aria-labelledby="rlh-title">
      {/* conteneur 1440 : sur les grands écrans le contenu reste à sa taille de maquette, centré */}
      <div className="rlh-in">
      <p className="rlh-tag">
        <i aria-hidden="true" />
        Nos réalisations
      </p>
      <h1 className="rlh-title" id="rlh-title">
        <span className="rlh-l">
          <span>Nos Clients Ne Cherchaient</span>
        </span>
        <span className="rlh-l">
          <span>
            Pas Une Agence. <em>Ils</em>
          </span>
        </span>
        <span className="rlh-l">
          <span>
            <em>Cherchaient Des Réservations.</em>
          </span>
        </span>
      </h1>
      <p className="rlh-text">
        Hôtels, lodges, tour-opérateurs, tables et salons. Chaque projet <br />
        en trois temps : le point de départ, ce que nous avons fait, ce que <br />
        ça a produit.
      </p>

      <div className="rlh-cards">
        {CARDS.map((c, i) => (
          <figure
            key={c.src}
            className="rlh-card"
            style={{ "--cx": c.cx, "--cy": c.cy, "--rot": `${c.rot}deg`, "--i": i } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.src} alt={c.alt} style={{ objectPosition: c.pos, ...(c.zoom && { "--z": c.zoom, transformOrigin: c.origin }) } as React.CSSProperties} />
          </figure>
        ))}
      </div>
      <p className="rlh-badge">
        <span>
          <b>{String(count).padStart(2, "0")}</b>
          <small>{count > 1 ? "études de cas" : "étude de cas"}</small>
        </span>
      </p>

      <ol className="rlh-steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === STEPS.length - 1 ? "is-on" : undefined}>
            {String(i + 1).padStart(2, "0")} {s}
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
