"use client";

import { useEffect, useId, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Titre qui apparaît « liquide » : des taches floues fusionnent puis se resserrent en lettres
 * (filtre SVG : flou + seuil de transparence). Joué une fois, à l'arrivée dans l'écran ; ensuite le filtre est retiré (texte net).
 */
export default function GooText({ children, className, as: Tag = "h2", delay = 0 }: { children: React.ReactNode; className?: string; as?: "h1" | "h2" | "p"; delay?: number }) {
  const id = "goo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const blur = blurRef.current!;
    if (prefersReducedMotion()) {
      el.style.filter = "none";
      el.style.opacity = "1";
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now() + delay * 1000;
        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - t0) / 1300));
          const k = 1 - (1 - t) ** 3;
          blur.setAttribute("stdDeviation", (26 * (1 - k)).toFixed(2));
          el.style.opacity = t > 0 ? "1" : "0";
          if (t < 1) raf = requestAnimationFrame(tick);
          else el.style.filter = "none";
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [delay]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <filter id={id} x="-20%" y="-60%" width="140%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="26" />
          <feColorMatrix mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -9" />
        </filter>
      </svg>
      <Tag ref={ref as never} className={className} style={{ filter: `url(#${id})`, opacity: 0 }}>
        {children}
      </Tag>
    </>
  );
}
