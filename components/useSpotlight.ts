"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Effet « projecteur » : une lumière dorée suit la souris (même à côté des cartes) et éclaire le bord
 * et le fond des cartes proches. À poser sur la LISTE (ref) ; chaque enfant direct reçoit --mx / --my (px)
 * et doit avoir la classe « spot » (styles dans globals.css). Inactif au doigt et si l'on réduit les animations.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    const cards = Array.from(list.children) as HTMLElement[];
    let raf = 0;
    let px = -9999;
    let py = -9999;
    const paint = () => {
      raf = 0;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", `${(px - r.left).toFixed(1)}px`);
        c.style.setProperty("--my", `${(py - r.top).toFixed(1)}px`);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    document.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}
