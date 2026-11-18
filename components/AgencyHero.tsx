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
  const magRef = useRef<SVGSVGElement>(null);

  // ligne magenta : calculée en pixels de la section. Elle part de derrière le bas gauche de la photo
  // (même point que sur la maquette, à l'échelle de la photo) et sort par le bord gauche de l'écran
  // AU-DESSUS du titre : sur un écran large la photo est réduite et centrée, la ligne ne doit pas traverser le texte.
  useEffect(() => {
    const sec = secRef.current!;
    const svg = magRef.current!;
    const path = svg.querySelector("path")!;
    const grad = svg.querySelector("linearGradient")!;
    const title = sec.querySelector<HTMLElement>(".agh-title")!;
    const frame = sec.querySelector<HTMLElement>(".agh-frame")!;
    const layout = () => {
      const W = sec.clientWidth;
      const H = sec.clientHeight;
      const k = frame.offsetWidth / 1332; // échelle de la photo
      const sx = frame.offsetLeft + 296 * k;
      const sy = frame.offsetTop + 601 * k;
      const ex = -10;
      const ey = Math.min(title.offsetTop - 14, frame.offsetTop + 848.5 * k);
      const dx = sx - ex;
      const dy = ey - sy;
      const c1x = ex + 0.37 * dx;
      const c1y = sy + 0.196 * dy;
      const c2x = ex + 0.065 * dx;
      const c2y = ey - 0.18 * dy;
      // prolongement hors écran dans la direction d'arrivée
      const tx = ex - c2x;
      const ty = ey - c2y;
      const tl = Math.hypot(tx, ty) || 1;
      const f = (v: number) => v.toFixed(1);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      path.setAttribute(
        "d",
        `M${f(sx)} ${f(sy)} C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(ey)} L${f(ex + (tx / tl) * 400)} ${f(ey + (ty / tl) * 400)}`,
      );
      path.style.strokeWidth = f(24 * k);
      grad.setAttribute("x1", f(ex + 0.58 * dx));
      grad.setAttribute("y1", f(sy + 0.21 * dy));
      grad.setAttribute("x2", f(ex));
      grad.setAttribute("y2", f(ey));
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(sec);
    return () => ro.disconnect();
  }, []);

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
        <path className="agh-line agh-line--teal" pathLength={1} d="M1103.8 146.9C1218.9 107.1 1364.7 101.8 1452.5 57.9L2300 -366" />
      </svg>
      <svg className="agh-mag" ref={magRef} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="aghGrad" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#91508c" />
            <stop offset="1" stopColor="#aa3a87" />
          </linearGradient>
        </defs>
        <path className="agh-line agh-line--mag" pathLength={1} />
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
