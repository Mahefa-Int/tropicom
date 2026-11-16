"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « L'Agence » — « 04 — Aujourd'hui » (suit « Le déclic »).
 * Maquette 1440 × 1135, fond noir ; bloc 1312 × 674 en (64, 380), coins 32, avec un dégradé magenta flou
 * (/images/agence/fond-magenta.webp, extrait de la maquette, texte retiré) qui dérive lentement.
 * Titre DM Sans 500 50 px « Tropi'Com est née de là. » (« de là. » jaune doré) ; paragraphes 19,6 / 30 ;
 * 4 pastilles penchées (39,4 de haut, texte 15,3 px 600) qui tombent à l'arrivée et qu'on peut attraper
 * (elles reviennent en place avec un ressort) ; citation 46 / 52 ; signature « Josceline » ; logo.
 */
const PILLS = [
  { text: "Saisonnalité", cx: 199.8, cy: 498, w: 139, rot: -9.57, tone: "yellow" },
  { text: "Marchés émetteurs", cx: 493.6, cy: 498.1, w: 192.7, rot: 9.46, tone: "white" },
  { text: "Poids d'un avis en ligne", cx: 822.5, cy: 498, w: 212, rot: -3.87, tone: "yellow" },
  { text: "Connexion internet à Nosy Be", cx: 1182, cy: 498.1, w: 260, rot: -20.06, tone: "gray" },
];

export default function AgencyToday() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current!;
    const bg = sec.querySelector<HTMLElement>(".agt-bg img");
    const pills = Array.from(sec.querySelectorAll<HTMLElement>(".agt-pill"));
    const still = prefersReducedMotion();

    // fond : léger décalage selon la souris
    const onMove = (e: PointerEvent) => {
      if (still || !bg || e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      bg.style.setProperty("--mx", (x * -30).toFixed(1) + "px");
      bg.style.setProperty("--my", (y * -20).toFixed(1) + "px");
    };
    sec.addEventListener("pointermove", onMove);

    // pastilles : on les attrape, elles reviennent en place avec un ressort (et un peu de rotation)
    const cleanups = pills.map((el) => {
      const s = { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 };
      let drag: { id: number; sx: number; sy: number; ox: number; oy: number; lx: number } | null = null;
      let raf = 0;
      let last = 0;
      const apply = () => el.style.setProperty("--d", `${s.x.toFixed(1)}px ${s.y.toFixed(1)}px`), applyR = () => el.style.setProperty("--dr", s.r.toFixed(2) + "deg");
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!drag) {
          s.vx += (-180 * s.x - 12 * s.vx) * dt;
          s.vy += (-180 * s.y - 12 * s.vy) * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
        }
        s.vr += (-160 * s.r - 10 * s.vr) * dt;
        s.r += s.vr * dt;
        apply();
        applyR();
        const moving = drag || Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.r) + Math.abs(s.vr) > 0.05;
        raf = moving ? requestAnimationFrame(tick) : 0;
        if (!moving) {
          s.x = s.y = s.r = 0;
          apply();
          applyR();
          el.classList.remove("is-held");
        }
      };
      const kick = () => {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      };
      const down = (e: PointerEvent) => {
        if (still) return;
        drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: s.x, oy: s.y, lx: e.clientX };
        el.setPointerCapture(e.pointerId);
        el.classList.add("is-held");
        kick();
      };
      const move = (e: PointerEvent) => {
        if (!drag || e.pointerId !== drag.id) return;
        s.x = drag.ox + e.clientX - drag.sx;
        s.y = drag.oy + e.clientY - drag.sy;
        // la pastille penche dans le sens du mouvement
        s.vr += (e.clientX - drag.lx) * 0.6;
        drag.lx = e.clientX;
      };
      const up = () => {
        drag = null;
        kick();
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
      };
    });

    return () => {
      sec.removeEventListener("pointermove", onMove);
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section className="agt" ref={secRef} data-reveal aria-labelledby="agt-title">
      <div className="agt-bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/agence/fond-magenta.webp" alt="" />
      </div>

      <p className="ags-label agt-label">
        <span className="ags-n">04</span>
        <span className="ags-bar" aria-hidden="true"></span>
        Aujourd&apos;hui
      </p>

      <h2 className="agt-title" id="agt-title">
        Tropi&apos;Com est née <span>de là.</span>
      </h2>

      <p className="agt-text agt-text--1">
        Une agence entièrement dédiée aux professionnels du tourisme de l&apos;Océan Indien. Pas une agence généraliste de plus : une équipe qui connaît <br />
        la saisonnalité, les marchés émetteurs, le poids d&apos;un avis en ligne et la réalité d&apos;une connexion internet à Nosy Be.
      </p>

      <ul className="agt-pills" aria-label="Ce que nous connaissons">
        {PILLS.map((p, i) => (
          <li
            key={p.text}
            className={"agt-pill agt-pill--" + p.tone}
            style={{ "--cx": p.cx, "--cy": p.cy, "--w": p.w, "--rot": p.rot + "deg", "--k": i } as React.CSSProperties}
          >
            {p.text}
          </li>
        ))}
      </ul>

      <p className="agt-text agt-text--2">
        Aujourd&apos;hui, nous accompagnons plus de quarante établissements et opérateurs dans la zone et au-delà. Notre travail n&apos;a pas changé depuis le <br />
        premier jour :
      </p>

      <blockquote className="agt-quote">
        Faire en sorte que le monde vous découvre, vous choisisse, et se <br />
        souvienne de vous.
      </blockquote>

      <div className="agt-sign">
        <p className="agt-sign-name">Josceline</p>
        <p className="agt-sign-role">Fondatrice de Tropi&apos;Com</p>
        <span className="agt-sign-mark" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="agt-logo" src="/images/logo-tropicom.svg" alt="Tropi'Com" width={110} height={60} />
    </section>
  );
}
