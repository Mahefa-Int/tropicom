"use client";

import { useEffect, useRef } from "react";
import CtaIcon from "./CtaIcon";
import Fireflies from "./Fireflies";
import Hummingbird from "./Hummingbird";

// 25 lucioles : environ 2/3 sur la moitié gauche, 1/3 sur la droite
const fireLeft = (i: number, r: (a: number, b: number) => number) => (i % 3 === 2 ? r(50, 97) : r(3, 50));
const fireTop = (_i: number, r: (a: number, b: number) => number) => r(5, 98);

/**
 * Hero — maquette 1440 × 810 (coins bas arrondis).
 * Tout est placé dans .hero-stage, une scène de 1440 × 810 « px de maquette » (unité --u),
 * centrée dans le hero. La colline (.hero-hill) déborde sur toute la largeur de l'écran.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const womanRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Compteur 0 → 48
  useEffect(() => {
    const counter = counterRef.current;
    if (!counter) return;
    let raf = 0;
    const timer = window.setTimeout(() => {
      const target = 48;
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = String(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, 1900);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Parallaxe à la souris (feuille + carte)
  useEffect(() => {
    const hero = heroRef.current;
    const card = cardRef.current;
    const leaf = leafRef.current;
    if (!hero || !card || !leaf) return;
    const move = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      leaf.style.translate = `${x * -18}px ${y * -12}px`;
      card.style.translate = `${x * 14}px ${y * 14}px`;
    };
    const leave = () => {
      leaf.style.translate = card.style.translate = "";
    };
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => {
      hero.removeEventListener("mousemove", move);
      hero.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Révélation de la couleur : un cercle suit la souris sur la femme (noir et blanc dessous,
  // couleur dessus, masquée hors du cercle) ; anneau blanc de même rayon autour du curseur.
  // Ne s'active que lorsque le curseur est sur la femme (test sur la transparence de l'image).
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const woman = womanRef.current;
    const ring = ringRef.current;
    if (!hero || !stage || !woman || !ring) return;

    // carte de transparence de l'image (réduite) pour savoir si le curseur est sur la femme
    let alpha: Uint8ClampedArray | null = null;
    const AW = 289;
    const AH = 340;
    const img = new Image();
    img.src = "/images/hero-femme-noir.webp";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = AW;
      c.height = AH;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, AW, AH);
      alpha = ctx.getImageData(0, 0, AW, AH).data;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const s = stage.getBoundingClientRect();
      const w = woman.getBoundingClientRect();
      const wx = e.clientX - w.left;
      const wy = e.clientY - w.top;
      // même point dans les deux repères : la scène (anneau) et la femme (masque de la couleur)
      stage.style.setProperty("--sx", `${e.clientX - s.left}px`);
      stage.style.setProperty("--sy", `${e.clientY - s.top}px`);
      woman.style.setProperty("--wx", `${wx}px`);
      woman.style.setProperty("--wy", `${wy}px`);
      let on = false;
      if (wx >= 0 && wy >= 0 && wx < w.width && wy < w.height) {
        if (alpha) {
          const ax = Math.floor((wx / w.width) * AW);
          const ay = Math.floor((wy / w.height) * AH);
          on = alpha[(ay * AW + ax) * 4 + 3] > 60;
        } else {
          on = true; // carte de transparence pas (encore) disponible : tout le cadre de l'image compte
        }
      }
      if (on) stage.dataset.reveal = "";
      else delete stage.dataset.reveal;
    };
    const leave = () => {
      delete stage.dataset.reveal;
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={heroRef}>
      {/* Colline : /images/hero-colline.png (2000 × 669), sur toute la largeur */}
      <div className="hero-hill" aria-hidden="true"></div>
      <Fireflies className="hero-fireflies" left={fireLeft} top={fireTop} />
      {/* Colibri : survole le hero et s'approche du curseur quand il s'arrête */}
      <Hummingbird />

      <div className="hero-stage" ref={stageRef}>
        {/* Halos : jaune doré en bas à gauche, bleu canard à droite */}
        <div className="hero-glow hero-glow--jaune" aria-hidden="true"></div>
        <div className="hero-glow hero-glow--bleu" aria-hidden="true"></div>
        {/* Feuille : /images/hero-feuille-monstera.png (inclinée de 19,7°) */}
        <div className="hero-leaf-wrap" aria-hidden="true" ref={leafRef}>
          <div className="hero-leaf"></div>
        </div>
        {/* Femme : /images/hero-femme-noir.webp dessous, /images/hero-femme-couleur.webp dessus
            (révélée dans le cercle qui suit la souris) */}
        <div className="hero-woman" aria-hidden="true" ref={womanRef}>
          <div className="hero-woman-bw"></div>
          <div className="hero-woman-color"></div>
        </div>
        <span className="hero-ring" aria-hidden="true" ref={ringRef}></span>

        <h1 className="hero-title">
          <span className="line"><span>Vos chambre</span></span>
          <span className="line"><span>valent q’une</span></span>
          <span className="line line-muted"><span>commission</span></span>
          <span className="line line-muted"><span>de 20%</span></span>
        </h1>

        <a href="#" className="cta hero-cta">
          <CtaIcon />
          <span className="cta-label">Entrer en contact</span>
        </a>

        <p className="hero-text">
          Tropi&apos;Com est l&apos;agence de marketing digital et{" "}
          <br />
          d&apos;automatisation dédiée aux hôtels, lodges et{" "}
          <br />
          tour-opérateurs de l&apos;Océan Indien. Marque,{" "}
          <br />
          contenu, acquisition, intelligence artificielle : nous{" "}
          <br />
          construisons la machine qui remplit vos{" "}
          <br />
          chambres en direct, et qui continue de tourner{" "}
          <br />
          en basse saison.
        </p>

        {/* Carte « Réponse sous 48 H » */}
        <div className="response-card" ref={cardRef}>
          <div className="response-info">
            <p>Réponse sous</p>
            <div className="response-value">
              <span className="response-icon" aria-hidden="true">
                {/* calendrier quadrillé + flèche circulaire */}
                <svg viewBox="0 0 24 24">
                  <rect x="3.5" y="3.5" width="15" height="15" rx="2.5" />
                  <path d="M3.5 8.5h15M3.5 13.5h10M8.5 3.5v15M13.5 3.5v10" />
                  <path className="tick" d="M21 16.5a4.5 4.5 0 1 1-1.3-3.2M20 11.3v2.2h-2.2" />
                </svg>
              </span>
              <strong>
                <span className="counter" ref={counterRef}>0</span> H
              </strong>
            </div>
          </div>
          {/* Image : /images/hero-carte-ordinateur.png */}
          <div className="response-img"></div>
        </div>

        {/* Destinations */}
        <ul className="hero-tags">
          <li>Madagascar</li>
          <li>Maurice</li>
          <li>La Réunion</li>
          <li>Seychelles</li>
        </ul>
      </div>
    </section>
  );
}
