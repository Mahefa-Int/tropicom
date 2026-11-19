"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Ruban de la page Réalisations : une bande de 24 px qui descend derrière les cartes, du jaune doré au
 * bleu canard puis au rose magenta (couleurs et tracé relevés sur la maquette, repère : bas du haut de page = 0).
 * Le tracé est recalculé pour le nombre de cartes : il passe toujours au milieu des espaces entre les cartes.
 * Il se « dessine » vers le bas au fil du défilement.
 */
/** passage du ruban dans la maquette : x au milieu des espaces entre cartes (1er, 2e… espace), puis tout en bas */
const GAP_X = [1345, 1318, 1281.5, 1237, 1187, 1129, 1062, 980];
const END_X = 868;
/** au-delà de la maquette, le ruban continue sa dérive vers la gauche (sans sortir de la page) */
const gapX = (k: number) => GAP_X[k - 1] ?? Math.max(420, GAP_X[GAP_X.length - 1] - (k - GAP_X.length) * 90);

/** courbe lissée passant par tous les points (Catmull-Rom → Bézier) */
function smooth(p: [number, number][]) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] ?? c;
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
}

/** tracé en unités de maquette pour « big » grandes cartes : passe au milieu de chaque espace, quel que soit leur nombre */
function ribbon(big: number) {
  const H = 96 + 704 * big + 540 + 96;
  const pts: [number, number][] = [
    [607.6, -40],
    [675.5, 1],
    [831.75, 95],
    [931, 155],
  ];
  if (big > 0) pts.push([1352, 500]);
  for (let k = 1; k <= big; k++) {
    const y = 96 + 704 * k - 32;
    pts.push([gapX(k), y]);
  }
  const endX = big <= GAP_X.length ? END_X : gapX(big) - 112;
  pts.push([endX, H - 48], [endX - 12, H + 36]);
  return { H, d: smooth(pts) };
}

const STOPS: [number, string][] = [
  [0, "#d9bd3a"],
  [0.121, "#b3b453"],
  [0.231, "#91ad68"],
  [0.342, "#6fa77e"],
  [0.453, "#4da094"],
  [0.563, "#5a8398"],
  [0.674, "#8c548d"],
  [0.784, "#bf2783"],
  [0.895, "#dd0b7c"],
  [1, "#dd0b7c"],
];

export default function RealisationsRibbon({ big }: { big: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { H, d } = ribbon(big);

  useEffect(() => {
    const svg = ref.current!;
    if (prefersReducedMotion()) {
      svg.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = svg.getBoundingClientRect();
      // le ruban est tracé jusqu'un peu sous le bas de l'écran
      const p = Math.min(1, Math.max(0, (innerHeight * 1.1 - r.top) / r.height));
      svg.style.setProperty("--p", p.toFixed(4));
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
    <svg ref={ref} className="rl-ribbon" viewBox={`0 0 1440 ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="rl-ribbon-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          {STOPS.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#rl-ribbon-g)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
