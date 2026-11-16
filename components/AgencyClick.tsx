"use client";

import { useEffect, useRef } from "react";
import RouteGlobe from "./RouteGlobe";

/**
 * Page « L'Agence » — « 03 — Le déclic » (suit « Notre histoire »).
 * Maquette 1440 × 991,5, fond #171616 : intitulé « 03 — Le déclic » en (64, 82,5) ; titre DM Sans 600 48 px / 46,5
 * en (290, 123,4) ; ligne de 24 (dégradé vertical vert-jaune → bleu ca) qui passe derrière la carte photo
 * 300 × 450 en (570, 280), coins 20 ; paragraphe 19,6 / 30 en (64, 793,5) ; à droite, schéma « ≈ 10 000 km » :
 * arc pointillé du point jaune (« Ce que vaut une adresse ») au cercle vide (« Ce qu'un voyageur en perçoit ») ;
 * lueur jaune floue sur le bord droit.
 * Carte : globe 3D animé (RouteGlobe) à la place de la photo du globe de la maquette.
 */
export default function AgencyClick() {
  const secRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // la carte photo glisse légèrement au défilement
  useEffect(() => {
    const sec = secRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const p = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
      cardRef.current?.style.setProperty("--py", (Math.max(-1, Math.min(1, p)) * -24).toFixed(1) + "px");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="agd" ref={secRef} data-reveal aria-labelledby="agd-title">
      <span className="agd-glow" aria-hidden="true"></span>

      <svg className="agd-line" viewBox="0 0 1440 991.5" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="agdGrad" gradientUnits="userSpaceOnUse" x1="0" y1="245" x2="0" y2="595">
            <stop offset="0" stopColor="#b4b454" />
            <stop offset="1" stopColor="#3e9d9e" />
          </linearGradient>
        </defs>
        <path pathLength={1} d="M-20 260C362 328.5 299.8 615 600 593.4" />
        <path pathLength={1} d="M850 534.3C1085.8 441.1 1311.5 327.6 1460 224.8" />
      </svg>

      <p className="ags-label agd-label">
        <span className="ags-n">03</span>
        <span className="ags-bar" aria-hidden="true"></span>
        Le déclic
      </p>

      <h2 className="agd-title" id="agd-title">
        Ce n&apos;est pas un problème de qualité. C&apos;est <br />
        un problème de traduction.
      </h2>

      <div className="agd-card" ref={cardRef}>
        {/* globe 3D : routes depuis Antananarivo vers les marchés émetteurs */}
        <RouteGlobe className="agd-globe" />
      </div>

      <p className="agd-text">
        Entre ce que vaut une adresse et ce qu&apos;un voyageur en perçoit à dix mille <br />
        kilomètres, il y a un écart, et cet écart se comble avec du métier.
      </p>

      {/* schéma : de ce que vaut une adresse à ce qu'un voyageur en perçoit */}
      <div className="agd-map" aria-hidden="true">
        <svg className="agd-arc" viewBox="775 790 600 120">
          <defs>
            <mask id="agdArcMask" maskUnits="userSpaceOnUse" x="775" y="790" width="600" height="120">
              <path className="agd-arc-reveal" pathLength={1} d="M792.6 870.2Q1072.1 728.9 1351 870.4" />
            </mask>
          </defs>
          <path className="agd-arc-dash" d="M792.6 870.2Q1072.1 728.9 1351 870.4" mask="url(#agdArcMask)" />
        </svg>
        <span className="agd-dot agd-dot--from"></span>
        <span className="agd-dot agd-dot--to"></span>
        <span className="agd-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20" />
            <path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z" />
          </svg>
          ≈ 10 000 km
        </span>
        <span className="agd-cap agd-cap--from">Ce que vaut une adresse</span>
        <span className="agd-cap agd-cap--to">Ce qu&apos;un voyageur en perçoit</span>
      </div>
    </section>
  );
}
