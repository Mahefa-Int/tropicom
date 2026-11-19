"use client";

import { useEffect, useRef } from "react";
import type { CaseCard } from "@/lib/cases";
import { prefersReducedMotion } from "@/lib/motion";
import GooText from "./GooText";

/**
 * Page Réalisations — « Projets » : un grand titre au centre, entouré d'une sphère de vignettes qui tourne en 3D.
 * Les vignettes devant passent sur le titre, celles derrière passent dessous et s'estompent.
 * Glisser pour faire tourner (avec élan) ; rotation lente au repos. Les vignettes sont décoratives (pas de lien).
 * À l'arrivée : la sphère se déploie depuis le centre, le titre apparaît « liquide ».
 */
const PER_CASE = 3; // chaque réalisation apparaît plusieurs fois pour remplir la sphère
const SIZES = [74, 58, 86, 64, 80, 54];

export default function RealisationsSphere({ cards }: { cards: CaseCard[] }) {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const items = cards.length ? Array.from({ length: Math.max(18, cards.length * PER_CASE) }, (_, i) => cards[i % cards.length]) : [];
  const n = items.length;

  useEffect(() => {
    const sec = secRef.current!;
    const stage = stageRef.current!;
    const reduce = prefersReducedMotion();
    // points répartis régulièrement sur la sphère (spirale de Fibonacci)
    const pts = Array.from({ length: n }, (_, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    });

    let ay = 0.4; // rotation autour de l'axe vertical
    let ax = -0.18; // inclinaison
    let vy = 0;
    let vx = 0;
    let open = reduce ? 1 : 0;
    let t0 = 0;
    let raf = 0;
    let visible = false;
    let dragging = false;
    let moved = false;
    let lx = 0;
    let ly = 0;

    const radius = () => Math.min(stage.clientWidth * 0.26, stage.clientHeight * 0.44, 370);

    const render = () => {
      const R = radius() * (0.15 + 0.85 * open);
      const cy = Math.cos(ay);
      const sy = Math.sin(ay);
      const cx = Math.cos(ax);
      const sx = Math.sin(ax);
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const [px, py, pz] = pts[i];
        // rotation Y puis X
        const x1 = px * cy + pz * sy;
        const z1 = -px * sy + pz * cy;
        const y2 = py * cx - z1 * sx;
        const z2 = py * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 derrière, 1 devant
        const yaw = Math.asin(Math.max(-1, Math.min(1, x1))) * 34;
        const pitch = -Math.asin(Math.max(-1, Math.min(1, y2))) * 20;
        el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(-y2 * R).toFixed(1)}px, ${(z2 * R).toFixed(1)}px) rotateY(${yaw.toFixed(1)}deg) rotateX(${pitch.toFixed(1)}deg)`;
        el.style.opacity = (open * (0.18 + 0.82 * depth ** 1.4)).toFixed(3);
        el.style.zIndex = String(Math.round(depth * 100));
      }
    };

    const tick = (now: number) => {
      raf = 0;
      if (t0 && open < 1) {
        const t = Math.min(1, (now - t0) / 1400);
        open = 1 - (1 - t) ** 3;
      }
      if (!dragging && !reduce) {
        ay += vy;
        ax += vx;
        vy = vy * 0.94 + 0.0016 * 0.06; // élan qui s'amortit vers la rotation lente
        vx *= 0.92;
        ax += (-0.18 - ax) * 0.02; // retour doux vers l'inclinaison de repos
      }
      render();
      if (visible) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !t0 && e.intersectionRatio > 0.3) {
          t0 = performance.now();
          sec.classList.add("in-view");
        }
        wake();
      },
      { threshold: [0, 0.3] },
    );
    io.observe(sec);

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      lx = e.clientX;
      ly = e.clientY;
      vy = 0;
      vx = 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        if (!moved) stage.classList.add("is-grabbing");
        moved = true;
      }
      vy = dx * 0.006;
      // au doigt, seul le geste horizontal fait tourner (le vertical fait défiler la page)
      vx = e.pointerType === "mouse" ? -dy * 0.004 : 0;
      ay += vy;
      ax = Math.max(-0.9, Math.min(0.9, ax + vx));
      wake();
    };
    const up = () => {
      dragging = false;
      stage.classList.remove("is-grabbing");
    };
    stage.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    render();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
    };
  }, [n]);

  return (
    <section className="rsp" ref={secRef} aria-label="Projets">
      <div className="rsp-stage" ref={stageRef}>
        <GooText as="h2" className="rsp-title">
          Projets<span>.</span>
        </GooText>
        <div className="rsp-sphere">
          {items.map((c, i) => {
            const s = SIZES[i % SIZES.length];
            return (
              <span
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="rsp-item"
                style={{ width: s, height: s * (i % 3 === 1 ? 1.3 : 0.78), marginLeft: -s / 2, marginTop: (-s * (i % 3 === 1 ? 1.3 : 0.78)) / 2 }}
                aria-hidden="true"
              >
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" draggable={false} loading="lazy" />
                ) : (
                  <span>{c.client}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <p className="rsp-count">
        {String(cards.length).padStart(2, "0")}
        <small>projets</small>
      </p>
    </section>
  );
}
