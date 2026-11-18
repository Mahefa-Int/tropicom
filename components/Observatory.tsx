"use client";

import { useRef } from "react";
import CtaIcon from "./CtaIcon";
import GlowField, { type Glow } from "./GlowField";

/**
 * « L'Observatoire du digital touristique — Océan Indien 2026 » (après les destinations).
 * Maquette 1440 × 928 : à gauche, carte 444 × 499 avec la couverture du rapport ; à droite, fond
 * turquoise (traînées floues), titre, paragraphe et bouton « Recevoir le rapport ».
 * Images : /images/observatoire/rapport-couverture.webp (fichier fourni, détouré, posé sur le fond #171616 de la carte)
 * ; fond turquoise : halos CSS (GlowField), positions ajustées par calcul sur l'ancienne image de la maquette.
 * À COMPLÉTER : le nombre d'établissements analysés ([N]) et le lien du bouton.
 */
// trois traînées turquoise en diagonale (repère du fond : 796 × 628)
const OBS_GLOWS: Glow[] = [
  { x: 1321, y: 210, rx: 980, ry: 136, rot: -22.2, c: "62, 157, 158", a: 1, dx: 40, dy: 25, sp: 0.3, m: 20 },
  { x: 453, y: 568, rx: 386, ry: 121, rot: -13.5, c: "62, 157, 158", a: 0.2, dx: 30, dy: 20, sp: 0.4, ph: 2, m: 15 },
  { x: 1104, y: -87.5, rx: 1221, ry: 125, rot: -21.4, c: "62, 157, 158", a: 0.6, dx: 40, dy: 20, sp: 0.35, ph: 4, m: 20 },
];

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
      {/* fond turquoise en CSS (halos flous animés en JS), ajusté sur l'ancienne image de la maquette */}
      <div className="obs-bg" aria-hidden="true">
        <GlowField glows={OBS_GLOWS} breath={0.4} />
      </div>

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
