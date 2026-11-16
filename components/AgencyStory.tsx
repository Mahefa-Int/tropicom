"use client";

import { Fragment, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « L'Agence » — « Notre histoire » (suit « Qui sommes-nous. »).
 * Maquette 1440 × 616 : photo 504 × 424 en (64, 96), coins 8 ; à droite, traits jaunes + « Notre histoire »
 * en (637, 68,5) ; deux temps « 01 — Ailleurs » (y 162) et « 02 — Le retour » (y 360) : numéro jaune doré,
 * trait 31 × 2 #3a3934, intitulé #a19d93 15,5 px ; paragraphes DM Sans 19,6 / 30 (−4 %) #f3f0e9.
 * Au défilement, les mots s'allument un à un (gris → crème), comme une lecture.
 * Image : /images/agence/fondatrice.webp — DÉCOUPÉE DANS LA MAQUETTE (basse définition), à remplacer par l'original.
 */
const STEPS = [
  {
    n: "01",
    label: "Ailleurs",
    paras: [
      [
        "Pendant dix ans, j'ai fait de la communication ailleurs. J'ai formé des équipes, gravi les",
        "échelons, puis piloté pendant quatre ans la communication de vingt-trois pays au sein",
        "d'une organisation internationale. C'était exigeant, et formateur.",
      ],
    ],
  },
  {
    n: "02",
    label: "Le retour",
    paras: [
      [
        "En rentrant à Madagascar, j'ai vu ce que je ne voyais plus. Des paysages que le monde",
        "entier voudrait voir. Une hospitalité que personne n'imite. Des maisons tenues par des",
        "gens qui y ont mis leur vie.",
      ],
      ["Et presque aucune visibilité."],
    ],
  },
];

export default function AgencyStory() {
  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = secRef.current!;
    const paras = Array.from(sec.querySelectorAll<HTMLElement>(".ags-text"));
    const words = paras.map((p) => Array.from(p.querySelectorAll<HTMLElement>(".ags-w")));
    if (prefersReducedMotion()) {
      words.flat().forEach((w) => w.classList.add("on"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      paras.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        // 0 quand le haut du paragraphe atteint 85 % de l'écran, 1 quand son bas atteint 55 %
        const prog = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
        const lit = Math.round(prog * words[i].length);
        words[i].forEach((w, k) => w.classList.toggle("on", k < lit));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="ags" ref={secRef} data-reveal aria-label="Notre histoire">
      <div className="ags-photo" tabIndex={0}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/agence/fondatrice.webp" alt="La fondatrice de Tropi'Com, ordinateur portable en main" loading="lazy" />
        {/* au survol : flou progressif sur les 3/4 du bas (8 couches, de 0 à 3,5 px) */}
        <div className="ags-blur" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => {
            const seg = 100 / 9;
            const st = [i, i + 1, i + 2, i + 3].map((k, j) => `rgba(255,255,255,${j === 1 || j === 2 ? 1 : 0}) ${k * seg}%`).join(", ");
            const mask = `linear-gradient(180deg, ${st})`;
            return (
              <span
                key={i}
                style={{ backdropFilter: `blur(${i * 0.5}px)`, WebkitBackdropFilter: `blur(${i * 0.5}px)`, maskImage: mask, WebkitMaskImage: mask }}
              />
            );
          })}
        </div>
      </div>

      <p className="ags-tag">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/agence/traits-jaunes.webp" alt="" aria-hidden="true" width={134} height={48} />
        Notre histoire
      </p>

      {STEPS.map((s, i) => (
        <div key={s.n} className={"ags-step ags-step--" + (i + 1)}>
          <p className="ags-label">
            <span className="ags-n">{s.n}</span>
            <span className="ags-bar" aria-hidden="true"></span>
            {s.label}
          </p>
          {s.paras.map((lines, j) => (
            <p key={j} className="ags-text">
              {lines.map((line, l) => (
                <Fragment key={l}>
                  {line.split(" ").map((w, k) => (
                    <Fragment key={k}>
                      <span className="ags-w">{w}</span>{" "}
                    </Fragment>
                  ))}
                  {l < lines.length - 1 && <br />}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}
