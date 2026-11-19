"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseCard } from "@/lib/cases";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page Réalisations — tableau des études de cas (N° · Projet · Secteur · Résultat · Lieu).
 * Au survol d'une ligne : la ligne se remplit du gris des cartes depuis la gauche, le numéro passe en jaune doré
 * (elle repart vers la droite en sortant), le texte passe en sombre, une flèche ↗ apparaît.
 * Un aperçu de l'image suit la souris (avec un léger retard) et change de projet par un volet vertical.
 * Couleurs du site : fond noir, jaune doré en simple accent.
 */
export default function RealisationsTable({ cards }: { cards: CaseCard[] }) {
  const prevRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState<number[]>([]); // images empilées : la dernière arrive par un volet

  useEffect(() => {
    if (active === null) return;
    setShown((s) => [...s.filter((i) => i !== active).slice(-2), active]);
  }, [active]);

  // l'aperçu suit la souris avec un ressort
  useEffect(() => {
    const el = prevRef.current!;
    if (prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let first = true;
    const tick = () => {
      const ax = 260 * (tx - x) - 28 * vx;
      const ay = 260 * (ty - y) - 28 * vy;
      vx += ax / 60 / 0.6;
      vy += ay / 60 / 0.6;
      x += vx / 60;
      y += vy / 60;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (first) {
        x = tx;
        y = ty;
        first = false;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="rtb" aria-labelledby="rtb-title">
      <header className="rtb-head-block">
        <h2 className="rtb-title" id="rtb-title">
          Études <em>&amp; résultats.</em>
        </h2>
        <p className="rtb-note">
          {cards.length} projets, en trois temps : le point de départ, ce que nous avons fait, ce que ça a produit.
        </p>
      </header>


      <div className="rtb-table" role="table" aria-label="Études de cas" onPointerLeave={() => setActive(null)}>
        <div className="rtb-head" role="row">
          <span role="columnheader">N°</span>
          <span role="columnheader">Projet</span>
          <span role="columnheader">Secteur</span>
          <span role="columnheader">Résultat</span>
          <span role="columnheader">Lieu</span>
        </div>
        {cards.map((c, i) => (
          <a
            key={c.href}
            href={c.href}
            role="row"
            className={"rtb-row" + (active === i ? " is-on" : "")}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          >
            <span role="cell" className="rtb-n">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span role="cell" className="rtb-client">
              {c.client}
            </span>
            <span role="cell" className="rtb-sector">
              {c.sector || "—"}
            </span>
            <span role="cell" className="rtb-result">
              {c.stat ? (
                <>
                  <b>{c.stat}</b> <small>{c.statText}</small>
                </>
              ) : (
                c.title
              )}
              <i aria-hidden="true">↗</i>
            </span>
            <span role="cell" className="rtb-place">
              {c.location || "—"}
            </span>
          </a>
        ))}
      </div>

      <div className={"rtb-preview" + (active !== null ? " is-on" : "")} ref={prevRef} aria-hidden="true">
        <div className="rtb-preview-in">
          {shown.map((i) => {
            const c = cards[i];
            return c?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={c.image} alt="" className={i === active ? "is-top" : undefined} />
            ) : (
              <span key={i} className={"rtb-preview-empty" + (i === active ? " is-top" : "")}>
                {c?.client}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
