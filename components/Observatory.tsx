"use client";

import { useRef } from "react";
import CtaIcon from "./CtaIcon";

/**
 * « L'Observatoire du digital touristique — Océan Indien 2026 » (après les destinations).
 * Maquette 1440 × 928 : à gauche, carte 444 × 499 avec la couverture du rapport ; à droite, fond
 * turquoise (traînées floues), titre, paragraphe et bouton « Recevoir le rapport ».
 * Images : /images/observatoire/rapport-couverture.webp (fichier fourni, détouré, posé sur le fond #171616 de la carte)
 * et fond-turquoise.webp (découpé dans la maquette, texte retiré).
 * À COMPLÉTER : le nombre d'établissements analysés ([N]) et le lien du bouton.
 */
export default function Observatory() {
  const coverRef = useRef<HTMLDivElement>(null);

  // la couverture s'incline légèrement vers la souris
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = coverRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + "deg");
    el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + "deg");
  };
  const onLeave = () => {
    coverRef.current?.style.setProperty("--rx", "0deg");
    coverRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <section className="obs" id="observatoire" data-reveal aria-labelledby="obs-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="obs-bg" src="/images/observatoire/fond-turquoise.webp" alt="" aria-hidden="true" />

      <div className="obs-card" ref={coverRef} onPointerMove={onMove} onPointerLeave={onLeave}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/observatoire/rapport-couverture.webp"
          alt="Couverture du rapport « L'Observatoire du digital touristique — Océan Indien 2026 »"
          loading="lazy"
        />
      </div>

      <h2 className="obs-title" id="obs-title">
        L&apos;OBSERVATOIRE DU DIGITAL <br />
        TOURISTIQUE - OCÉAN INDIEN 2026.
      </h2>
      <p className="obs-text">
        Nous avons analysé la présence en ligne de [N] établissements haut de gamme de <br />
        la zone : site, réservation directe, référencement, réseaux sociaux, e-réputation, <br />
        visibilité dans les IA génératives. Le rapport complet, les scores par territoire, et les <br />
        dix écarts qui expliquent la majorité des résultats.
      </p>

      <a href="#" className="cta obs-cta">
        <CtaIcon />
        <span className="cta-label">Recevoir le rapport</span>
      </a>
    </section>
  );
}
