"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import GlowField, { type Glow } from "./GlowField";

/**
 * Page « L'Agence » — « 04 — Aujourd'hui » (suit « Le déclic »).
 * Maquette 1440 × 1135, fond noir ; bloc 1312 × 674 en (64, 380), coins 32, avec un dégradé magenta flou
 * en CSS (halos flous animés en JS, ajustés par calcul sur l'ancienne image de la maquette).
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

// traînées magenta floues (repère du bloc : 1312 × 674)
const AGT_GLOWS: Glow[] = [
  { x: -135.0, y: 597.3, rx: 703.0, ry: 30.1, rot: 9.6, c: "222, 11, 125", a: 1.0, dx: 40, dy: 25, sp: 0.3, ph: 0, m: 20 },
  { x: 531.6, y: 229.4, rx: 526.7, ry: 148.4, rot: -18.1, c: "222, 11, 125", a: 0.3, dx: 40, dy: 25, sp: 0.35, ph: 2, m: 20 },
  { x: -623.7, y: 1223.8, rx: 1973.7, ry: 195.9, rot: -22.4, c: "222, 11, 125", a: 0.9, dx: 40, dy: 25, sp: 0.4, ph: 4, m: 20 },
  { x: 993.6, y: 1361.3, rx: 90.0, ry: 230.0, rot: 10.0, c: "222, 11, 125", a: 0.3, dx: 40, dy: 25, sp: 0.45, ph: 6, m: 20 },
  { x: -221.5, y: 704.8, rx: 903.5, ry: 210.5, rot: 324.7, c: "222, 11, 125", a: 1, dx: 40, dy: 25, sp: 0.5, ph: 8, m: 20 },
];

export default function AgencyToday() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current!;
    const pills = Array.from(sec.querySelectorAll<HTMLElement>(".agt-pill"));
    const still = prefersReducedMotion();

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
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section className="agt" ref={secRef} data-reveal aria-labelledby="agt-title">
      <div className="agt-bg" aria-hidden="true">
        <GlowField glows={AGT_GLOWS} breath={0.4} />
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
