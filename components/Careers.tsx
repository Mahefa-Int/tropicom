"use client";

import { useEffect, useRef } from "react";
import CtaIcon from "./CtaIcon";
import GlowField, { type Glow } from "./GlowField";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page « Carrières » (maquette 1440 × 2646), en trois sections :
 * - haut de page 832 : « Faire Rayonner L'Océan Indien, Depuis L'Océan Indien. », halos CSS (bleu ca en haut à gauche,
 *   blanc / jaune à droite), ligne en boucle (24, dégradé vertical #beb64c → #80aa71) qui se dessine ;
 * - « État d'esprit » 760, fond #171616 : photo de tournage (noir et blanc, couleur au survol) + widgets flottants ;
 * - « Ce que nous offrons » 1054 : ligne bleu ca, photo de l'équipement + widgets, deux cartes « Postes ouverts » /
 *   « Candidature spontanée ».
 * Images : /images/carriere/*.webp (fournies ; photos recadrées comme sur la maquette).
 * À COMPLÉTER : liens des boutons, intitulés des postes.
 */

// tracés relevés sur la maquette
const LINE_HERO = "M1460.3 422.7C1456.4 431.6 1442.5 462.8 1436.6 476.1C1430.7 489.4 1428.7 494.1 1424.8 502.8C1420.8 511.5 1416.8 519.9 1412.9 528.4C1408.9 536.9 1404.9 545.2 1401.0 553.8C1397.0 562.4 1393.0 571.1 1389.0 580.0C1385.1 589.0 1380.9 598.4 1377.4 607.6C1373.9 616.9 1370.6 626.5 1368.1 635.5C1365.7 644.6 1364.4 653.7 1362.7 662.0C1361.0 670.4 1360.0 678.3 1357.8 685.5C1355.5 692.7 1352.4 698.3 1349.4 705.3C1346.3 712.3 1342.3 719.0 1339.5 727.5C1336.6 736.1 1333.4 747.2 1332.4 756.5C1331.4 765.8 1331.0 776.3 1333.6 783.3C1336.2 790.3 1341.9 796.6 1348.2 798.3C1354.4 800.0 1363.2 797.7 1371.1 793.5C1378.9 789.4 1388.2 781.0 1395.3 773.2C1402.4 765.5 1409.7 755.7 1413.8 746.9C1417.9 738.2 1420.8 728.8 1420.0 720.9C1419.1 712.9 1414.5 705.2 1408.7 699.1C1402.9 693.0 1393.4 687.7 1385.3 684.0C1377.2 680.3 1368.3 677.7 1360.2 677.1C1352.0 676.5 1344.4 678.3 1336.4 680.4C1328.4 682.5 1320.6 686.7 1312.3 689.7C1303.9 692.7 1295.3 695.6 1286.4 698.3C1277.5 701.0 1268.3 703.5 1259.0 706.1C1249.8 708.8 1240.3 711.3 1231.1 714.1C1221.8 716.9 1212.4 719.8 1203.3 723.2C1194.3 726.5 1185.3 730.2 1176.6 734.1C1167.8 738.1 1159.2 742.4 1150.8 746.8C1142.3 751.3 1134.0 756.0 1125.7 760.8C1117.4 765.6 1109.3 770.6 1101.2 775.6C1093.0 780.7 1085.0 785.8 1076.9 790.9C1068.9 796.1 1060.9 801.2 1052.8 806.3C1044.8 811.3 1036.7 816.4 1028.6 821.2C1020.5 826.1 1016.4 828.3 1004.1 835.4C991.9 842.4 963.3 858.9 955.1 863.6";
const LINE_OFFER = "M750.8 -12.0C750.7 -7.0 750.3 8.0 750.2 18.0C750.0 28.0 749.9 38.0 749.8 48.0C749.8 58.0 749.8 68.0 749.8 78.0C749.8 88.0 749.9 98.0 750.1 108.0C750.2 118.0 750.4 128.0 750.7 138.0C750.9 148.0 751.2 158.0 751.6 168.0C751.9 178.0 752.3 188.0 752.7 198.0C753.2 208.0 753.6 218.0 754.2 228.0C754.7 238.0 755.2 248.0 755.8 258.0C756.5 268.0 757.1 278.0 757.8 288.0C758.5 298.0 759.2 308.0 760.0 318.0C760.8 328.0 761.6 338.0 762.4 348.0C763.3 358.0 764.1 368.0 765.1 378.0C766.0 388.0 766.9 398.0 767.9 408.0C768.9 418.0 769.9 428.0 771.0 438.0C772.1 448.0 773.2 458.0 774.3 468.0C775.4 478.0 776.6 488.0 777.7 498.0C778.9 508.0 780.1 518.0 781.4 528.0C782.6 538.0 783.9 548.0 785.2 558.0C786.5 568.0 787.8 578.0 789.2 588.0C790.5 598.0 791.9 608.0 793.3 618.0C794.7 628.0 796.1 638.0 797.6 648.0C799.0 658.0 800.5 668.0 802.0 678.0C803.5 688.0 805.0 698.0 806.5 708.0C808.0 718.0 809.6 728.0 811.2 738.0C812.7 748.0 814.3 758.0 815.9 768.0C817.5 778.0 819.1 788.0 820.8 798.0C822.4 808.0 824.0 818.0 825.7 828.0C827.4 838.0 829.0 848.0 830.7 858.0C832.4 868.0 834.1 878.0 835.8 888.0C837.5 898.0 839.3 908.0 841.0 918.0C842.7 928.0 844.4 938.0 846.2 948.0C847.9 958.0 849.7 968.0 851.4 978.0C853.2 988.0 855.0 998.0 856.7 1008.0C858.5 1018.0 861.1 1033.0 862.0 1038.0";

const HERO_GLOWS: Glow[] = [
  { x: 0, y: 0, rx: 640, ry: 560, c: "62, 157, 158", a: 0.95, dx: 90, dy: 60, sp: 0.4, m: 40 },
  { x: 1440, y: 40, rx: 300, ry: 420, c: "255, 255, 255", a: 0.12, dx: 50, dy: 60, sp: 0.5, ph: 2 },
  { x: 1500, y: 760, rx: 330, ry: 540, c: "227, 190, 52", a: 0.4, dx: 70, dy: 90, sp: 0.45, ph: 4, m: -40 },
];
const OFFER_GLOWS: Glow[] = [{ x: 1480, y: 420, rx: 380, ry: 540, c: "62, 157, 158", a: 0.32, dx: 90, dy: 120, sp: 0.4, m: -50 }];

/** Ligne qui se dessine au défilement, jusqu'aux trois quarts de l'écran. */
function useDrawOnScroll(secRef: React.RefObject<HTMLElement | null>, pathRef: React.RefObject<SVGPathElement | null>, height: number) {
  useEffect(() => {
    const sec = secRef.current!;
    const path = pathRef.current!;
    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0";
      return;
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
      const k = r.height / height;
      // jusqu'aux trois quarts de l'écran ; tout entière dès que le bas de la section est visible
      const target = (Math.max(innerHeight * 0.75, Math.min(innerHeight, r.bottom)) - r.top) / k + (r.bottom <= innerHeight ? 200 : 0);
      // la ligne du haut de page se trace dans l'ordre du chemin ; on prend la plus longue portion dont tous les points sont au-dessus
      let drawn = 0;
      for (const s of samples) {
        if (s.y <= target) drawn = s.l;
        else break;
      }
      path.style.strokeDashoffset = String(1 - drawn / total);
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
  }, [secRef, pathRef, height]);
}

/** Widgets qui flottent doucement et suivent un peu la souris (profondeur différente pour chacun). */
function useFloat(secRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const sec = secRef.current!;
    const items = Array.from(sec.querySelectorAll<HTMLElement>("[data-depth]"));
    if (prefersReducedMotion()) return;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let visible = false;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = 0;
      const t = (now - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.07;
      mouse.y += (mouse.ty - mouse.y) * 0.07;
      items.forEach((el, i) => {
        const d = Number(el.dataset.depth);
        // mouvement volontairement léger (quelques pixels au plus)
        const fx = Math.sin(t * 0.6 + i * 1.7) * 1.2 * d + mouse.x * 4 * d;
        const fy = Math.cos(t * 0.7 + i * 1.3) * 2 * d + mouse.y * 3 * d;
        el.style.setProperty("--fx", fx.toFixed(1) + "px");
        el.style.setProperty("--fy", fy.toFixed(1) + "px");
      });
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(sec);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = sec.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width - 0.5;
      mouse.ty = (e.clientY - r.top) / r.height - 0.5;
    };
    sec.addEventListener("pointermove", onMove);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      sec.removeEventListener("pointermove", onMove);
    };
  }, [secRef]);
}

function Place() {
  return (
    <p className="car-place">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/agence/traits-jaunes.webp" alt="" aria-hidden="true" width={134} height={48} />
      Madagascar — Océan Indien
    </p>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ol className="car-list">
      {items.map((t, i) => (
        <li key={t} style={{ "--k": i } as React.CSSProperties}>
          <span className="car-list-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="car-list-t">{t}</span>
        </li>
      ))}
    </ol>
  );
}

export function CareersHero() {
  const secRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  useDrawOnScroll(secRef, pathRef, 832);
  useEffect(() => {
    const t = setTimeout(() => secRef.current?.classList.add("in-view"), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="car-hero" ref={secRef} aria-labelledby="car-title">
      <GlowField glows={HERO_GLOWS} />
      <svg className="car-line" viewBox="0 0 1440 832" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="carHeroGrad" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="832">
            <stop offset="0" stopColor="#beb64c" />
            <stop offset="1" stopColor="#80aa71" />
          </linearGradient>
        </defs>
        <path ref={pathRef} d={LINE_HERO} pathLength={1} />
      </svg>

      <p className="car-tag car-hero-tag">
        <span className="dot" aria-hidden="true"></span>Carrières
      </p>
      <h1 className="car-hero-title" id="car-title">
        Faire Rayonner <br />
        L&apos;Océan Indien, <br />
        Depuis L&apos;Océan <br />
        Indien.
      </h1>
      <Place />
      <a href="#postes" className="cta car-cta car-hero-cta">
        <CtaIcon />
        <span className="cta-label">Voir les postes ouverts</span>
      </a>
    </section>
  );
}

export function CareersMindset() {
  const secRef = useRef<HTMLElement>(null);
  useFloat(secRef);

  return (
    <section className="car-mind" ref={secRef} data-reveal aria-labelledby="car-mind-title">
      <div className="car-photo car-mind-photo" data-depth="0.4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/carriere/tournage.webp" alt="Tournage d'un concert, caméra à la main" loading="lazy" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--chiffres" data-depth="1.2" src="/images/carriere/widget-chiffres.webp" alt="21 pays visités, plus de 40 établissements" width={276} height={80} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--perf" data-depth="1" src="/images/carriere/widget-performance.webp" alt="" aria-hidden="true" width={172} height={80} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--etal" data-depth="1.4" src="/images/carriere/widget-etalonnage.webp" alt="" aria-hidden="true" width={226} height={80} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--bobine" data-depth="0.8" src="/images/carriere/widget-bobine.webp" alt="" aria-hidden="true" width={187} height={80} />

      <p className="car-tag car-mind-tag">
        <span className="dot" aria-hidden="true"></span>État d&apos;esprit
      </p>
      <h2 className="car-title car-mind-title" id="car-mind-title">
        Nous recrutons des gens qui <br />
        ont un avis.
      </h2>
      <List items={["Défendre une recommandation", "La mesurer", "L'ajuster"]} />
      <p className="car-mind-text">
        Chez Tropi&apos;Com, on n&apos;exécute pas une commande : on défend une recommandation, on la <br />
        mesure, on l&apos;ajuste. <br />
        Nos clients sont des hôtels et des opérateurs qui attendent un partenaire, pas un prestataire, <br />
        et c&apos;est ce que nous attendons de vous.
      </p>
    </section>
  );
}

export function CareersOffer() {
  const secRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  useDrawOnScroll(secRef, pathRef, 1054);
  useFloat(secRef);

  return (
    <section className="car-offer" ref={secRef} data-reveal aria-labelledby="car-offer-title">
      <GlowField glows={OFFER_GLOWS} />
      <svg className="car-line" viewBox="0 0 1440 1054" preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} className="car-line-teal" d={LINE_OFFER} pathLength={1} />
      </svg>

      <p className="car-tag car-offer-tag">
        <span className="dot" aria-hidden="true"></span>Ce que nous offrons
      </p>
      <h2 className="car-title car-offer-title" id="car-offer-title">
        Nous recrutons des gens qui <br />
        ont un avis.
      </h2>
      <List
        items={[
          "Des projets à impact visible",
          "Des déplacements sur les plus beaux sites de la zone",
          "Un accès aux outils et aux formations les plus récents",
          "Une équipe qui préfère la clarté à la hiérarchie",
        ]}
      />

      <div className="car-photo car-offer-photo" data-depth="0.4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/carriere/equipement-drone.webp" alt="Stabilisateur et téléphone, matériel de tournage" loading="lazy" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--plan-haut" data-depth="1.2" src="/images/carriere/widget-plan-haut.webp" alt="" aria-hidden="true" width={129} height={80} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--plan-bas" data-depth="1.4" src="/images/carriere/widget-plan-bas.webp" alt="" aria-hidden="true" width={121} height={80} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="car-w car-w--bobines" data-depth="1" src="/images/carriere/widget-bobines.webp" alt="" aria-hidden="true" width={145} height={80} />

      <div className="car-card car-card--jobs" id="postes">
        <p className="car-card-tag">Postes ouverts</p>
        <h3 className="car-card-title">
          Les offres du <br />
          moment.
        </h3>
        <p className="car-card-ph">[Intitulés des postes en cours]</p>
        <a href="#" className="cta car-cta car-card-cta">
          <CtaIcon />
          <span className="cta-label">Voir les postes ouverts</span>
        </a>
      </div>
      <div className="car-card car-card--apply">
        <p className="car-card-tag">Candidature spontanée</p>
        <h3 className="car-card-title">
          Aucun poste ouvert ? <br />
          Écrivez-nous quand <br />
          même.
        </h3>
        <p className="car-card-ph">[Nous gardons les bons profils]</p>
        <a href="#" className="cta car-cta car-card-cta">
          <CtaIcon />
          <span className="cta-label">Nous écrire</span>
        </a>
      </div>
    </section>
  );
}
