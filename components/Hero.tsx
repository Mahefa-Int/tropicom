"use client";

import { useEffect, useRef } from "react";
import CtaIcon from "./CtaIcon";
import Fireflies from "./Fireflies";

// 25 lucioles : environ 2/3 sur la moitié gauche, 1/3 sur la droite
const fireLeft = (i: number, r: (a: number, b: number) => number) => (i % 3 === 2 ? r(50, 97) : r(3, 50));
const fireTop = (_i: number, r: (a: number, b: number) => number) => r(5, 98);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // Parallaxe à la souris (halo + carte)
  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    const card = cardRef.current;
    if (!hero || !glow || !card) return;
    const move = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      glow.style.translate = `${x * 40}px ${y * 30}px`;
      card.style.translate = `${x * 14}px ${y * 14}px`;
    };
    const leave = () => {
      glow.style.translate = card.style.translate = "";
    };
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => {
      hero.removeEventListener("mousemove", move);
      hero.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={heroRef}>
      {/* Fond : /images/colline-tv.png (3772x1668) */}
      <div className="hero-haze" aria-hidden="true"></div>
      <div className="hero-bg" aria-hidden="true">
        <span className="tv-screen"></span>
      </div>
      <Fireflies className="hero-fireflies" left={fireLeft} top={fireTop} />
      <div className="hero-glow" aria-hidden="true" ref={glowRef}></div>
      {/* Image : /images/hero-femme-casque-vr.png (retournée en miroir, comme sur la maquette) */}
      <div className="hero-woman" aria-hidden="true"></div>

      <div className="hero-content">
        <h1 className="hero-title">
          <span className="line"><span>Vos chambre</span></span>
          <span className="line"><span>valent q’une</span></span>
          <span className="line line-muted"><span>commission de 20%</span></span>
        </h1>

        <a href="#" className="cta hero-cta">
          <CtaIcon />
          <span className="cta-label">Entrer en contact</span>
        </a>

        <p className="hero-text">
          Tropi&apos;Com est l&apos;agence de marketing digital et d&apos;automatisation dédiée aux hôtels, lodges et
          tour-opérateurs de l&apos;Océan Indien. Marque, contenu, acquisition, intelligence artificielle : nous
          construisons la machine qui remplit vos chambres en direct, et qui continue de tourner en basse saison.
        </p>
      </div>

      {/* Carte "Réponse sous 48 H" */}
      <div className="response-card" ref={cardRef}>
        <div className="response-info">
          <p>Réponse sous</p>
          <div className="response-value">
            <span className="response-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4" y="5" width="16" height="15" rx="2.5" />
                <path d="M4 10h16M9 3v4M15 3v4" />
                <path className="tick" d="M8.5 14.5l2.2 2.2 4.8-4.6" />
              </svg>
            </span>
            <strong>
              <span className="counter" ref={counterRef}>0</span> H
            </strong>
          </div>
        </div>
        {/* Image : /images/hero-carte-reponse.png */}
        <div className="response-img"></div>
      </div>

      {/* Destinations */}
      <ul className="hero-tags">
        <li>Madagascar</li>
        <li>Maurice</li>
        <li>La Réunion</li>
        <li>Seychelles</li>
      </ul>
    </section>
  );
}
