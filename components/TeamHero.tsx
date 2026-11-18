"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Notre histoire » — haut de page « Des Spécialistes, Pas Des Polyvalents. » + schéma
 * « Vous ne racontez jamais votre histoire deux fois. » (maquettes 52 et 53, assemblées sur 1440 × 1270).
 * Fond : sans image — taches de lumière en CSS (dégradés radiaux floutés) animées en JS.
 * Ligne : 24 d'épaisseur, dégradé horizontal bleu ca (x 440) → jaune (x 1440), dessinée au défilement,
 * passe derrière le bloc schéma (1213 × 561 en (113,5 ; 625), fond #171616).
 */
// tracé relevé sur la maquette (repère 1440 × 1270, prolongé hors champ à droite)
const LINE =
  "M1484.4 398.6C1476.1 404.5 1447.3 425.3 1434.9 434.2C1422.6 443.1 1418.8 446.9 1410.2 452.1C1401.6 457.2 1392.5 461.6 1383.3 465.3C1374.0 469.0 1364.4 472.0 1354.7 474.4C1345.0 476.8 1335.0 478.5 1325.0 479.7C1315.1 481.0 1305.0 481.6 1294.9 481.8C1284.9 482.1 1274.9 481.8 1264.9 481.1C1255.0 480.4 1245.1 479.3 1235.2 477.9C1225.4 476.5 1215.6 474.6 1205.8 472.6C1196.0 470.5 1186.3 468.0 1176.6 465.4C1167.0 462.8 1157.3 459.8 1147.7 456.8C1138.1 453.7 1128.6 450.4 1119.1 447.0C1109.5 443.5 1100.0 439.9 1090.6 436.1C1081.1 432.3 1071.6 428.0 1062.2 424.0C1052.8 419.9 1043.2 413.5 1034.1 411.9C1025.1 410.2 1016.0 410.1 1007.9 413.9C999.9 417.6 992.4 426.7 985.9 434.2C979.4 441.7 974.0 450.5 969.1 459.1C964.1 467.6 960.1 476.6 956.3 485.7C952.5 494.7 949.4 504.1 946.3 513.6C943.2 523.0 940.4 532.7 937.7 542.4C935.0 552.1 932.6 561.9 930.1 571.7C927.6 581.5 925.2 591.3 922.7 601.1C920.3 610.9 917.9 620.7 915.5 630.5C913.1 640.3 910.7 650.1 908.3 659.9C905.9 669.7 903.5 679.5 901.2 689.3C898.8 699.1 896.4 708.9 894.1 718.7C891.7 728.5 889.4 738.3 887.0 748.1C884.7 757.8 882.4 767.6 880.0 777.4C877.7 787.2 875.3 796.9 873.0 806.7C870.6 816.5 868.3 826.2 865.9 836.0C863.6 845.8 861.2 855.5 858.9 865.3C856.5 875.0 854.1 884.8 851.8 894.5C849.4 904.3 847.0 914.0 844.6 923.7C842.2 933.5 839.8 943.2 837.3 952.9C834.9 962.6 832.5 972.3 830.0 982.1C827.5 991.8 825.1 1001.5 822.6 1011.2C820.1 1020.9 817.5 1030.6 815.0 1040.2C812.5 1049.9 809.9 1059.6 807.3 1069.3C804.7 1078.9 802.1 1088.6 799.5 1098.3C796.8 1107.9 794.2 1117.6 791.5 1127.2C788.8 1136.8 786.1 1146.5 783.3 1156.1C780.5 1165.7 777.7 1175.3 774.9 1185.0C772.1 1194.6 769.2 1204.2 766.3 1213.8C763.4 1223.3 760.5 1232.9 757.5 1242.5C754.6 1252.1 751.5 1261.6 748.5 1271.2C745.4 1280.7 742.3 1290.3 739.2 1299.8C736.0 1309.4 732.9 1318.9 729.6 1328.4C726.4 1337.9 723.1 1347.4 719.8 1356.9C716.4 1366.4 713.1 1375.8 709.6 1385.3C706.2 1394.8 702.7 1404.2 699.2 1413.6C695.7 1423.0 692.1 1432.4 688.5 1441.8C684.9 1451.2 681.2 1460.6 677.4 1469.9C673.7 1479.2 669.9 1488.6 666.1 1497.8C662.2 1507.1 658.3 1516.4 654.4 1525.6C650.4 1534.9 646.4 1544.1 642.3 1553.3C638.2 1562.5 634.1 1571.6 629.9 1580.8C625.7 1589.9 621.4 1599.0 617.1 1608.1C612.8 1617.1 608.4 1626.2 604.0 1635.2C599.5 1644.2 595.0 1653.1 590.4 1662.1C585.9 1671.0 581.2 1679.9 576.5 1688.7C571.8 1697.6 567.0 1706.4 562.2 1715.2C557.3 1723.9 552.4 1732.7 547.4 1741.4C542.4 1750.1 537.4 1758.7 532.3 1767.3C527.1 1775.9 521.9 1784.5 516.7 1793.0C511.4 1801.5 506.0 1810.0 500.6 1818.4C495.2 1826.8 489.7 1835.2 484.1 1843.5C478.5 1851.9 472.9 1860.1 467.2 1868.4C461.4 1876.6 455.6 1884.8 449.7 1892.9C443.8 1901.0 437.9 1909.0 431.8 1917.0C425.7 1925.0 419.6 1932.9 413.4 1940.8C407.2 1948.7 400.9 1956.5 394.5 1964.2C388.1 1971.9 381.6 1979.6 375.1 1987.2C368.5 1994.8 361.9 2002.3 355.1 2009.7C348.4 2017.1 341.6 2024.5 334.7 2031.7C327.8 2039.0 320.8 2046.2 313.7 2053.3C306.6 2060.4 299.4 2067.4 292.2 2074.3C284.9 2081.2 277.5 2088.0 270.1 2094.7C262.6 2101.5 255.1 2108.1 247.4 2114.6C239.8 2121.1 232.0 2127.6 224.2 2133.9C216.4 2140.2 208.4 2146.4 200.4 2152.5C192.4 2158.6 184.3 2164.6 176.1 2170.4C167.8 2176.3 159.5 2182.1 151.1 2187.7C142.7 2193.3 134.2 2198.9 125.7 2204.3C117.1 2209.6 108.4 2214.9 99.7 2220.1C91.0 2225.2 82.3 2230.2 73.6 2235.1C64.9 2239.9 56.2 2244.7 47.6 2249.3C39.0 2253.9 30.4 2258.4 22.1 2262.7C13.7 2267.0 9.7 2269.0 -2.7 2275.2C-15.1 2281.5 -44.0 2296.1 -52.3 2300.3";

/* taches lumineuses du fond (repère 1440 × 1270) : centre, rayons, rotation, couleur, opacité, amplitude de dérive (px),
   vitesse, phase, sensibilité à la souris — calées sur la maquette :
   bande bleu ca en diagonale derrière le titre, lueur blanche en haut à droite, rose magenta autour du schéma. */
const BLOBS = [
  { x: 840, y: 530, rx: 780, ry: 190, rot: -13, c: "62, 157, 158", a: 0.5, dx: 160, dy: 60, sp: 0.45, ph: 0.6, m: 60 },
  { x: 1160, y: 440, rx: 320, ry: 150, rot: -22, c: "62, 157, 158", a: 0.35, dx: 180, dy: 90, sp: 0.6, ph: 2.2, m: 80 },
  { x: 1440, y: 0, rx: 260, ry: 260, rot: 0, c: "255, 255, 255", a: 0.18, dx: 70, dy: 60, sp: 0.5, ph: 5, m: 40 },
  { x: 200, y: 1250, rx: 330, ry: 260, rot: 0, c: "222, 11, 125", a: 0.72, dx: 170, dy: 80, sp: 0.55, ph: 0, m: 70 },
  { x: 380, y: 1010, rx: 260, ry: 150, rot: -10, c: "222, 11, 125", a: 0.32, dx: 200, dy: 90, sp: 0.5, ph: 1.7, m: 90 },
  { x: 1460, y: 1130, rx: 260, ry: 300, rot: 0, c: "222, 11, 125", a: 0.5, dx: 140, dy: 160, sp: 0.6, ph: 3.1, m: -70 },
  { x: 1060, y: 1250, rx: 300, ry: 120, rot: 0, c: "222, 11, 125", a: 0.32, dx: 240, dy: 50, sp: 0.42, ph: 4.4, m: -90 },
];

const SPECIALTIES = ["Stratégie", "Direction artistique", "Production", "Acquisition", "Technologie"];

export default function TeamHero() {
  const secRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pinkRef = useRef<HTMLDivElement>(null);

  // halo rose : chaque tache dérive lentement (sinusoïdes déphasées), respire, et suit un peu la souris
  useEffect(() => {
    const sec = secRef.current!;
    const spots = Array.from(pinkRef.current!.children) as HTMLElement[];
    if (prefersReducedMotion()) return;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = 0;
      const t = (now - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      // amplitudes données à 1440 de large : mises à l'échelle de l'écran
      const k = sec.clientWidth / 1440;
      spots.forEach((el, i) => {
        const b = BLOBS[i];
        // trajectoire en boucle (deux sinusoïdes) + suivi de la souris
        const dx = (Math.sin(t * b.sp + b.ph) * b.dx + Math.sin(t * b.sp * 2.1 + b.ph) * b.dx * 0.25 + mouse.x * b.m) * k;
        const dy = (Math.cos(t * b.sp * 0.8 + b.ph) * b.dy + mouse.y * b.m) * k;
        const s = 1 + Math.sin(t * b.sp * 1.3 + b.ph * 2) * 0.22;
        const o = 0.65 + Math.sin(t * b.sp * 0.9 + b.ph) * 0.35;
        const r = b.rot + Math.sin(t * b.sp * 0.7 + b.ph) * 8;
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);
      });
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(pinkRef.current!);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    sec.addEventListener("pointermove", onMove);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      sec.removeEventListener("pointermove", onMove);
    };
  }, []);

  // la ligne se dessine au défilement jusqu'aux trois quarts de l'écran
  useEffect(() => {
    const sec = secRef.current!;
    const path = pathRef.current!;
    const t = setTimeout(() => sec.classList.add("in-view"), 60);
    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return () => clearTimeout(t);
    }
    const total = path.getTotalLength();
    const samples: { l: number; y: number }[] = [];
    for (let i = 0; i <= 300; i++) {
      const l = (total * i) / 300;
      samples.push({ l, y: path.getPointAtLength(l).y });
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const k = r.width / 1440;
      // au chargement on montre déjà le haut de la ligne (jusqu'à l'écran entier)
      const target = (Math.max(innerHeight * 0.75, innerHeight - 60) - r.top) / k;
      let drawn = 0;
      for (const s of samples) if (s.y <= target) drawn = s.l;
      path.style.strokeDashoffset = String(1 - drawn / total);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="tmh" ref={secRef} aria-labelledby="tmh-title">
      {/* fond : taches de lumière floues en CSS (bleu ca, blanc, rose magenta), animées en JS (dérive, respiration, souris) */}
      <div className="tmh-pink" ref={pinkRef} aria-hidden="true">
        {BLOBS.map((b, i) => (
          <span
            key={i}
            style={{ "--x": b.x, "--y": b.y, "--rx": b.rx, "--ry": b.ry, "--a": b.a, "--c": b.c, "--rot": b.rot + "deg" } as React.CSSProperties}
          ></span>
        ))}
      </div>

      <svg className="tmh-line" viewBox="0 0 1440 1270" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="tmhGrad" gradientUnits="userSpaceOnUse" x1="440" y1="0" x2="1440" y2="0">
            <stop offset="0" stopColor="#3e9d9e" />
            <stop offset="1" stopColor="#e3be34" />
          </linearGradient>
        </defs>
        <path ref={pathRef} d={LINE} pathLength={1} />
      </svg>

      <p className="tmh-tag">
        <span className="dot" aria-hidden="true"></span>L&apos;équipe
      </p>
      <h1 className="tmh-title" id="tmh-title">
        Des Spécialistes,{" "}
        <br />
        Pas Des Polyvalents.
      </h1>
      <p className="tmh-text">
        Stratégie, direction artistique, production, acquisition, technologie. Chaque projet est piloté{" "}
        <br />
        par un interlocuteur unique qui connaît votre établissement et mobilise les bonnes{" "}
        <br />
        compétences au bon moment.
      </p>
      <p className="tmh-place">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/agence/traits-jaunes.webp" alt="" aria-hidden="true" width={134} height={48} />
        Madagascar — Océan Indien
      </p>

      {/* schéma : votre établissement → un interlocuteur unique → les spécialités */}
      <div className="tmh-card">
        <h2 className="tmh-card-title">Vous ne racontez jamais votre histoire deux fois.</h2>
        <p className="tmh-card-sub">COMMENT CIRCULE UN PROJET</p>

        <div className="tmh-box tmh-box--you">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <p>
            Votre{" "}
            <br />
            établissement
          </p>
        </div>

        <span className="tmh-link tmh-link--1" aria-hidden="true"><i></i></span>

        <div className="tmh-box tmh-box--one">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <p>
            Un interlocuteur{" "}
            <br />
            unique
          </p>
        </div>

        <span className="tmh-link tmh-link--2" aria-hidden="true"><i></i></span>

        <ol className="tmh-skills">
          {SPECIALTIES.map((s, i) => (
            <li key={s} style={{ "--k": i } as React.CSSProperties}>
              <span className="tmh-skill-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="tmh-skill-name">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

