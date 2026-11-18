"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Parcours « Pourquoi Tropi'Com » → atouts → destinations (maquette 1440 × 4580).
 * Une seule ligne verte → jaune traverse les trois sections : elle passe derrière la pile de cartes,
 * derrière les 3 cartes en escalier, puis derrière la carte de texte et la mini-carte des destinations
 * (atténuée dans le cadre des destinations, comme sur la maquette).
 * Au milieu, les atouts sont une scène sticky (hauteur variable) : la ligne y est dessinée par
 * Strengths.tsx ; ici on n'affiche que le haut (Pourquoi) et le bas (destinations) de la ligne.
 * La ligne se dessine au fil du défilement.
 */
const LINE =
  "M-24 192 C-16 194 -11.3 195.1 0 198 C27.3 205 92.6 221.9 140 235 C189.2 248.6 241 263.3 290 278 C337.6 292.3 366.5 305.4 430 322 C559.8 355.9 933.7 440 1030 448 C1100 453.8 1166 446 1167 482 C1168 522 1060 560 900 638 C820 677 781 730.2 740 762 C702.6 791.1 683.7 814.4 660 842 C637.9 867.8 618.6 894.7 601.5 922 C585.1 948.1 571.6 961.3 559 1002 C526.9 1105.5 490.8 1441.5 492.5 1585 C493.5 1669.2 509.1 1720.2 520 1785 C530.4 1846.7 537.7 1888.7 556 1965 C588.7 2101.4 666.5 2374.9 714.5 2530 C748.6 2640.1 776.7 2716.8 809.5 2810 C842.4 2903.5 873 2988 911.5 3090 C958.2 3213.9 1029.7 3395 1071.5 3500 C1097.7 3565.8 1113.5 3603.7 1136.5 3660 C1162.3 3723 1187.5 3784.6 1219 3860 C1260.2 3958.5 1324.4 4107.7 1363 4200 C1389.4 4263.2 1410.1 4314.6 1429 4360 C1443 4393.7 1453.7 4418.7 1466 4448";

export default function Journey({ children }: { children: React.ReactNode }) {
  const topRef = useRef<SVGPathElement>(null);
  const botRef = useRef<SVGPathElement>(null);
  const topTipRef = useRef<SVGCircleElement>(null);
  const botTipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const bot = botRef.current;
    const topTip = topTipRef.current;
    const botTip = botTipRef.current;
    if (!top || !bot || !topTip || !botTip) return;
    if (prefersReducedMotion()) {
      top.style.strokeDashoffset = bot.style.strokeDashoffset = "0";
      return;
    }
    // pathLength = 1 : le CSS cache la ligne au départ. Échantillons (longueur, y) pour savoir
    // jusqu'où dessiner : la ligne est dessinée jusqu'aux trois quarts de l'écran.
    const total = top.getTotalLength();
    const N = 400;
    const samples: { l: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const l = (total * i) / N;
      samples.push({ l, y: top.getPointAtLength(l).y });
    }
    // tête ronde avec un point blanc au bout du trait (comme la ligne rose des expertises) :
    // visible pendant le tracé, seulement dans la partie de la ligne affichée par ce SVG
    const draw = (path: SVGPathElement, tip: SVGCircleElement, y0: number, y1: number) => {
      const svg = path.ownerSVGElement!;
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const target = y0 + (innerHeight * 0.75 - rect.top) / (rect.width / 1440);
      let drawn = 0;
      for (const s of samples) if (s.y <= target) drawn = s.l;
      path.style.strokeDashoffset = String(1 - drawn / total);
      const p = top.getPointAtLength(drawn);
      tip.setAttribute("cx", p.x.toFixed(1));
      tip.setAttribute("cy", p.y.toFixed(1));
      tip.classList.toggle("on", drawn > 0 && drawn < total - 1 && p.y > y0 + 8 && p.y < y1 - 8);
    };
    let raf = 0;
    const update = () => {
      raf = 0;
      draw(top, topTip, 0, 813.5);
      draw(bot, botTip, 3621, 4430);
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
    <div className="journey">
      {/* haut de la ligne : section « Pourquoi » */}
      <svg className="journey-line journey-line--top" viewBox="0 0 1440 813.5" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {/* dégradé horizontal relevé sur la maquette : vert à gauche → jaune à droite */}
          <linearGradient id="journeyGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0" stopColor="#64a586" />
            <stop offset="1" stopColor="#e3bd34" />
          </linearGradient>
        </defs>
        <path ref={topRef} d={LINE} pathLength={1} />
        <circle ref={topTipRef} className="line-tip" r="8" cx="0" cy="0" />
      </svg>
      {children}
      {/* bas de la ligne : destinations (atténuée dans le cadre, comme sur la maquette) */}
      <svg className="journey-line journey-line--bottom" viewBox="0 3621 1440 809" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <mask id="journeyMask" maskUnits="userSpaceOnUse" x="-100" y="3500" width="1640" height="1200">
            <rect x="-100" y="3500" width="1640" height="1200" fill="#fff" />
            <rect x="64" y="3621" width="1312" height="809" fill="#c4c4c4" />
          </mask>
        </defs>
        <g mask="url(#journeyMask)">
          <path ref={botRef} d={LINE} pathLength={1} />
          <circle ref={botTipRef} className="line-tip" r="8" cx="0" cy="0" />
        </g>
      </svg>
    </div>
  );
}
