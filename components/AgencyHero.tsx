"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import RippleHover from "./RippleHover";

/**
 * Page « L'Agence » — première section « Qui sommes-nous. ».
 * Maquette 1440 × 1175 : photo de l'équipe 1332 × 650 en (54, 128), coins 12 ; ligne bleu ca (haut droite)
 * et ligne violet → magenta (bas gauche) de 24 d'épaisseur qui passent derrière la photo ;
 * feuille jaune 160 × 182 en (1245,6 ; 70,9) par-dessus ; pastille « Madagascar » 101 × 36 en (54, 788) ;
 * titre DM Sans 500 68 px ; paragraphe 15,5 / 20 ; étiquette « Notre histoire » et
 * « Madagascar — Océan Indien » sur la ligne y 1018 ; lueur blanche floue au bord droit.
 * Images : /images/agence/equipe.webp (fournie), feuille-jaune.webp (fournie), traits-jaunes.webp (découpés dans la maquette).
 */
export default function AgencyHero() {
  const secRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const sec = secRef.current!;
    // apparition dès le chargement (la section est en haut de page)
    const t = setTimeout(() => sec.classList.add("in-view"), 60);
    if (prefersReducedMotion()) return () => clearTimeout(t);

    // la photo glisse légèrement au défilement (parallaxe dans son cadre), la feuille se balance
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / r.height));
      photoRef.current?.style.setProperty("--py", (p * 60).toFixed(1) + "px");
      leafRef.current?.style.setProperty("--lr", (p * 14).toFixed(2) + "deg");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="agh" ref={secRef} aria-labelledby="agh-title">
      <span className="agh-glow" aria-hidden="true"></span>

      {/* lignes qui passent derrière la photo */}
      <svg className="agh-lines" viewBox="0 0 1440 1175" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="aghGrad" gradientUnits="userSpaceOnUse" x1="202" y1="782" x2="0" y2="963">
            <stop offset="0" stopColor="#91508c" />
            <stop offset="1" stopColor="#aa3a87" />
          </linearGradient>
        </defs>
        <path className="agh-line agh-line--teal" pathLength={1} d="M1103.8 146.9C1218.9 107.1 1364.7 101.8 1452.5 57.9L2300 -366" />
        <path className="agh-line agh-line--mag" pathLength={1} d="M350.5 729.1C123.4 777.6 15.9 932 -7.5 976.5L-160 1266" />
      </svg>

      {/* photo + feuille : réduites ensemble si l'écran est bas, pour que la photo tienne dans 100vh */}
      <div className="agh-frame">
      <div className="agh-photo" ref={photoRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/agence/equipe.webp"
          alt="L'équipe Tropi'Com sur un canapé jaune, avec tablette, ordinateur, téléphone et appareil photo"
          width={2664}
          height={1960}
        />
        {/* ondulation d'eau : survol = vaguelettes, clic = grosse goutte (simulation de vagues WebGL, par-dessus l'image) */}
        <RippleHover src="/images/agence/equipe.webp" className="agh-ink" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="agh-leaf" ref={leafRef} src="/images/agence/feuille-jaune.webp" alt="" aria-hidden="true" width={320} height={364} />
      </div>

      <p className="agh-pill">
        <span className="agh-pill-dot" aria-hidden="true"></span>Madagascar
      </p>

      <h1 className="agh-title" id="agh-title">
        QUI SOMMES-NOUS.
      </h1>
      <p className="agh-text">
        Le récit fondateur actuel est votre meilleur actif éditorial. Il est juste trop long et trop intime <br />
        pour la première visite d&apos;un directeur de groupe. Version resserrée, même sincérité, plus <br />
        de tenue.
      </p>

      <p className="agh-tag">
        <span className="dot" aria-hidden="true"></span>Notre histoire
      </p>
      <p className="agh-place">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/agence/traits-jaunes.webp" alt="" aria-hidden="true" width={134} height={48} />
        Madagascar — Océan Indien
      </p>
    </section>
  );
}
