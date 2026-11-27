"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import type { CaseCard } from "@/lib/cases";

/**
 * Essai (page /essai) : galerie horizontale des études de cas.
 * Un titre, puis une rangée de cartes photo (400 × 500) épinglée à l'écran : en descendant, la rangée glisse
 * de la première carte centrée à la dernière carte centrée. Bas de carte teinté aux couleurs de la charte,
 * numéro, nom du client et chiffre clé. Mouvement lissé (suivi amorti), sans bibliothèque.
 */
const HUES = ["var(--jaune-dore)", "var(--bleu-ca)", "var(--rose-magenta)"];

export default function GalleryCases({ cases }: { cases: CaseCard[] }) {
  const secRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const n = cases.length;

  useEffect(() => {
    const sec = secRef.current!;
    const row = rowRef.current!;
    const reduced = prefersReducedMotion();
    let target = 0;
    let cur = 0;
    let raf = 0;
    const measure = () => {
      const run = sec.offsetHeight - innerHeight;
      target = run > 0 ? Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / run)) : 0;
    };
    const paint = () => {
      cur += (target - cur) * (reduced ? 1 : 0.12);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      // distance : de la première carte centrée à la dernière carte centrée
      const first = row.children[0] as HTMLElement | undefined;
      const step = first ? first.offsetWidth + parseFloat(getComputedStyle(row).columnGap || "0") : 0;
      row.style.transform = `translate3d(${(-cur * (n - 1) * step).toFixed(1)}px, 0, 0)`;
      raf = cur === target ? 0 : requestAnimationFrame(paint);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(paint);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  if (!n) return null;

  return (
    <div className="gc">
      <section className="gc-intro">
        <p className="gc-tag">
          <i aria-hidden="true" />
          Nos réalisations
        </p>
        <h2>
          Des projets, <em>des résultats.</em>
        </h2>
      </section>

      {/* une demi-hauteur d'écran de défilement par carte */}
      <div className="gc-scroll" ref={secRef} style={{ height: `${100 + (n - 1) * 50}svh` }}>
        <div className="gc-sticky">
          <div className="gc-row" ref={rowRef}>
            {cases.map((c, i) => (
              <a
                key={c.href}
                href={c.href}
                className="gc-item"
                style={{ "--hue": HUES[i % HUES.length], "--img": c.image ? `url("${c.image}")` : "none" } as React.CSSProperties}
              >
                <span className="gc-content">
                  <span className="gc-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="gc-name">{c.client}</span>
                  {c.stat && (
                    <span className="gc-stat">
                      <b>{c.stat}</b> {c.statText}
                    </span>
                  )}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="gc-outro">
        <a href="/realisations" className="gc-all">
          Voir toutes les réalisations
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </section>
    </div>
  );
}
