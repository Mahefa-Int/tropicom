"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Notre histoire » — « 03 — Direction » : Josceline (maquette 51, 1440 × 661).
 * Carte photo 340 × 420 en (64, 161), coins 24 ; badge « Tropi'Com — Fondatrice » penché, à cheval sur la carte
 * (/images/equipe/badge-fondatrice.webp, découpé dans la maquette) ; nom 600 70 px ; rôle 22,6 px ;
 * 3 lignes intitulé (13,1 px gras #707070) / valeur (20 px), centrées sur y 296,5 / 405 / 512.
 * Photo : /images/equipe/josceline.webp (recadrée depuis la photo de la fondatrice).
 * À COMPLÉTER : les deux lignes entre crochets.
 */
const ROWS = [
  { k: "CHEZ TROPI'COM", v: "[Une ligne sur ce qu'elle fait chez Tropi'Com]", muted: true },
  {
    k: "AVANT",
    v: "A piloté pendant quatre ans la\ncommunication de vingt-trois pays au sein\nd'une organisation internationale.",
  },
  { k: "CHEZ TROPI'COM", v: "[Pays préféré · meilleure adresse de la zone]", muted: true },
];

export default function TeamDirection() {
  const secRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLImageElement>(null);

  // le badge penche un peu vers la souris
  useEffect(() => {
    const sec = secRef.current!;
    const badge = badgeRef.current!;
    if (prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      badge.style.setProperty("--bx", (x * 14).toFixed(1) + "px");
      badge.style.setProperty("--by", (y * 10).toFixed(1) + "px");
      badge.style.setProperty("--br", (x * 6).toFixed(2) + "deg");
    };
    const onLeave = () => {
      badge.style.setProperty("--bx", "0px");
      badge.style.setProperty("--by", "0px");
      badge.style.setProperty("--br", "0deg");
    };
    sec.addEventListener("pointermove", onMove);
    sec.addEventListener("pointerleave", onLeave);
    return () => {
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="tmd" ref={secRef} data-reveal aria-labelledby="tmd-name">
      <p className="ags-label tmd-label">
        <span className="ags-n">03</span>
        <span className="ags-bar" aria-hidden="true"></span>
        DIRECTION
      </p>

      <div className="tmd-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/equipe/josceline.webp" alt="Josceline, fondatrice et CEO de Tropi'Com" loading="lazy" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="tmd-badge"
        ref={badgeRef}
        src="/images/equipe/badge-fondatrice.webp"
        alt="Badge Tropi'Com — Fondatrice, n° 01, Océan Indien"
        width={447}
        height={454}
      />

      <h2 className="tmd-name" id="tmd-name">
        JOSCELINE
      </h2>
      <p className="tmd-role">CEO, Tropi&apos;Com Agency</p>

      <dl className="tmd-rows">
        {ROWS.map((r, i) => (
          <div key={i} className={"tmd-row tmd-row--" + (i + 1)} style={{ "--k": i } as React.CSSProperties}>
            <dt>{r.k}</dt>
            <dd className={r.muted ? "is-muted" : undefined}>
              {r.v.split("\n").map((l, j, all) => (
                <span key={j}>
                  {l}
                  {j < all.length - 1 && (
                    <>
                      {" "}
                      <br />
                    </>
                  )}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
