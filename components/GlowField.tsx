"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Fond lumineux sans image : taches floues en dégradé radial (CSS), animées en JS
 * (dérive en boucle, respiration, légère rotation, suivi de la souris). L'animation ne tourne que si c'est visible.
 * Coordonnées dans le repère de la maquette (largeur 1440), mises à l'échelle avec --g.
 */
export type Glow = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot?: number;
  c: string; // « r, g, b »
  a: number;
  dx?: number;
  dy?: number;
  sp?: number;
  ph?: number;
  m?: number;
};

export default function GlowField({ glows, className }: { glows: Glow[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current!;
    const host = box.parentElement!;
    const spots = Array.from(box.children) as HTMLElement[];
    if (prefersReducedMotion()) return;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = 0;
      const t = (now - t0) / 1000;
      const k = host.clientWidth / 1440;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      spots.forEach((el, i) => {
        const b = glows[i];
        const sp = b.sp ?? 0.5;
        const ph = b.ph ?? i * 1.3;
        const dxA = b.dx ?? 120;
        const dyA = b.dy ?? 70;
        const m = b.m ?? 50;
        const dx = (Math.sin(t * sp + ph) * dxA + Math.sin(t * sp * 2.1 + ph) * dxA * 0.25 + mouse.x * m) * k;
        const dy = (Math.cos(t * sp * 0.8 + ph) * dyA + mouse.y * m) * k;
        const s = 1 + Math.sin(t * sp * 1.3 + ph * 2) * 0.18;
        const o = 0.7 + Math.sin(t * sp * 0.9 + ph) * 0.3;
        const r = (b.rot ?? 0) + Math.sin(t * sp * 0.7 + ph) * 6;
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
      });
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(box);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = host.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
    };
  }, [glows]);

  return (
    <div className={"glow-field" + (className ? " " + className : "")} ref={ref} aria-hidden="true">
      {glows.map((b, i) => (
        <span
          key={i}
          style={
            {
              "--x": b.x,
              "--y": b.y,
              "--rx": b.rx,
              "--ry": b.ry,
              "--a": b.a,
              "--c": b.c,
              transform: `rotate(${b.rot ?? 0}deg)`,
            } as React.CSSProperties
          }
        ></span>
      ))}
    </div>
  );
}
