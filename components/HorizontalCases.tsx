"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import type { CaseCard } from "@/lib/cases";

/**
 * Essai (page /essai) : défilement horizontal des études de cas.
 * La section est épinglée à l'écran : en descendant, les panneaux (un par réalisation, plein écran)
 * défilent de droite à gauche. Le grand nom du client glisse en sens inverse (effet de profondeur),
 * la photo reste centrée en bas. Mouvement lissé (suivi amorti, sans bibliothèque).
 * Fonds aux couleurs de la charte : noir charbon, bleu ca, rose magenta, jaune doré.
 */
const THEMES = ["is-charbon", "is-teal", "is-magenta", "is-gold"];

export default function HorizontalCases({ cases }: { cases: CaseCard[] }) {
  const secRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const n = cases.length;

  useEffect(() => {
    const sec = secRef.current!;
    const track = trackRef.current!;
    const titles = Array.from(track.querySelectorAll<HTMLElement>(".hz-word"));
    const reduced = prefersReducedMotion();
    let target = 0;
    let cur = 0;
    let raf = 0;

    const measure = () => {
      const r = sec.getBoundingClientRect();
      const run = sec.offsetHeight - innerHeight;
      target = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0;
    };
    const paint = () => {
      // suivi amorti : la piste rattrape la position du défilement en douceur
      cur += (target - cur) * (reduced ? 1 : 0.12);
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const pos = cur * (n - 1); // 0 → n-1 : panneau affiché
      track.style.transform = `translate3d(${-pos * 100}vw, 0, 0)`;
      titles.forEach((t, i) => {
        // -1 (panneau à droite) → 0 (centré) → 1 (sorti à gauche) : le mot glisse en sens inverse
        const local = Math.max(-1, Math.min(1, pos - i));
        t.style.transform = `translate3d(${(-local * 45).toFixed(2)}vw, 0, 0)`;
      });
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
    // hauteur = un écran par étude de cas : c'est la distance de défilement de la piste horizontale
    <section className="hz" ref={secRef} style={{ height: `${n * 100}svh` }} aria-label="Études de cas">
      <div className="hz-pin">
        <ul className="hz-track" ref={trackRef} style={{ width: `${n * 100}vw` }}>
          {cases.map((c, i) => (
            <li key={c.href} className={"hz-panel " + THEMES[i % THEMES.length]}>
              <p className="hz-meta">
                <i aria-hidden="true" />
                Étude de cas {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </p>
              {/* taille adaptée à la longueur du nom : il tient dans l'écran quand le panneau est centré */}
              <h2 className="hz-word" style={{ fontSize: `min(15vw, ${(160 / Math.max(6, c.client.length)).toFixed(1)}vw)` }}>
                {c.client}
              </h2>
              {c.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="hz-img" src={c.image} alt={c.client} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
              )}
              <div className="hz-info">
                <p className="hz-title">{c.title}</p>
                {c.stat && (
                  <p className="hz-stat">
                    <b>{c.stat}</b> {c.statText}
                  </p>
                )}
              </div>
              <a className="hz-link" href={c.href}>
                Voir l’étude
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
