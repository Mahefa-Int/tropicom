"use client";

import { useEffect, useRef } from "react";
import CtaIcon from "./CtaIcon";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * « Parlons de votre prochaine saison. » — appel au contact, juste avant le pied de page.
 * Maquette 1440 × 553 : étiquette centrée, titre DM Sans 70 px, paragraphe 15,6 / 20 sur 2 lignes,
 * bouton « Réserver un créneau » 196 × 50. Décor (lueur blanche à droite, deux traits jaunes flous) :
 * décor en CSS (lueur blanche à droite + deux traits jaunes flous animés) ; il suit un peu la souris.
 * Bulle à cheval sur la FAQ, animée en JS : reflet irisé aux couleurs de la charte (bleu ca, jaune doré,
 * rose magenta) qui tourne lentement, légère dérive vers la souris (ressort), parallaxe au défilement,
 * membrane qui « respire ». Volontairement discrète.
 * À COMPLÉTER : le lien du bouton (prise de rendez-vous).
 */
export default function ContactCta() {
  const decorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch" || !decorRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * -24;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * -16;
    decorRef.current.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
  };

  useEffect(() => {
    const el = bubbleRef.current;
    if (!el || prefersReducedMotion()) return;

    // position (ressort) : cible = attirance vers la souris + parallaxe du défilement
    let x = 0, y = 0, vx = 0, vy = 0;
    let mx = 0, my = 0; // attirance souris (px)
    let raf = 0;
    let visible = false;
    const t0 = performance.now();

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      // attirance douce, plafonnée à 22 px, plus forte quand la souris est proche
      const pull = Math.min(22, 9000 / (d + 300));
      mx = (dx / d) * pull;
      my = (dy / d) * pull;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const t = (now - t0) / 1000;
      const r = el.getBoundingClientRect();
      // parallaxe : la bulle remonte un peu plus vite que la page
      const py = (r.top + r.height / 2 - innerHeight / 2) * -0.06;
      // flottement lent
      const fx = Math.sin(t * 0.45) * 6;
      const fy = Math.cos(t * 0.6) * 9;
      const tx = mx + fx;
      const ty = my + fy + py;
      // ressort amorti
      vx = (vx + (tx - x) * 0.018) * 0.9;
      vy = (vy + (ty - y) * 0.018) * 0.9;
      x += vx;
      y += vy;
      // la membrane se déforme légèrement avec la vitesse et « respire »
      const breath = Math.sin(t * 1.1) * 0.012;
      const stretch = Math.max(-0.04, Math.min(0.04, (Math.abs(vx) - Math.abs(vy)) * 0.004));
      el.style.setProperty("--bx", x.toFixed(2) + "px");
      el.style.setProperty("--by", y.toFixed(2) + "px");
      el.style.setProperty("--sx", (1 + breath + stretch).toFixed(4));
      el.style.setProperty("--sy", (1 - breath - stretch).toFixed(4));
      el.style.setProperty("--ang", ((t * 18) % 360).toFixed(1) + "deg");
      raf = requestAnimationFrame(tick);
    };

    // l'animation ne tourne que quand la bulle est à l'écran
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="ctc" id="contact" data-reveal aria-labelledby="ctc-title" onPointerMove={onMove}>
      <div className="ctc-clip" aria-hidden="true">
        {/* décor en CSS : lueur blanche au bord droit + deux traits jaunes flous */}
        <div ref={decorRef} className="ctc-decor">
          <span className="ctc-glow" />
          <span className="ctc-mark ctc-mark--a" />
          <span className="ctc-mark ctc-mark--b" />
        </div>
      </div>
      {/* bulle à cheval entre la FAQ et le contact (remplit le vide entre les deux sections) */}
      <span className="ctc-bubble" ref={bubbleRef} aria-hidden="true"></span>
      <p className="ctc-tag">
        <span className="dot" aria-hidden="true"></span>Contact
      </p>
      <h2 className="ctc-title" id="ctc-title">
        PARLONS DE VOTRE PROCHAINE SAISON.
      </h2>
      <p className="ctc-text">
        Trente minutes avec un membre de notre équipe. Nous regardons ensemble votre situation, nous vous disons ce que nous ferions à votre place, et si nous ne sommes pas les{" "}
        <br />
        bons interlocuteurs, nous vous le disons aussi.
      </p>
      <a href="#" className="cta ctc-cta">
        <CtaIcon />
        <span className="cta-label">Réserver un créneau</span>
      </a>
    </section>
  );
}
