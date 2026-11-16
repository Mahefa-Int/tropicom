"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Nos atouts — entre « Pourquoi » et les destinations. Scène sticky : pendant le défilement, les 3 cartes
 * (421 × 522) arrivent l'une après l'autre et se posent côte à côte, centres à −464 / 0 / +464 du milieu,
 * penchées −3° / 0° / +3°. La ligne verte → jaune du parcours passe derrière elles.
 * Chaque carte : panneau du haut (schéma « Océan Indien », projecteur, puce), titre, pastilles, texte, point de couleur.
 * Images : /images/atouts/*.webp (découpées dans la maquette, à remplacer par les originaux si besoin).
 */
type Card = {
  id: string;
  tone: "teal" | "magenta" | "gray";
  title: string[];
  pills?: string[];
  text: string;
  panel: React.ReactNode;
  pos: { dx: number; rot: number };
};

/** Schéma : l'océan Indien au centre, les marchés émetteurs autour. */
function Orbit() {
  const markets = [
    { name: "Europe", x: 186, y: 6.5, center: true },
    { name: "Asie", x: 19.5, y: 66.5, center: true },
    { name: "Afrique australe", x: 299, y: 66.5 },
    { name: "Golfe", x: 311, y: 163, center: true },
    { name: "Inde", x: 69, y: 166, center: true },
  ];
  return (
    <div className="atu-orbit">
      <span className="atu-orbit-ring" aria-hidden="true"></span>
      <span className="atu-orbit-core" aria-hidden="true">
        <i></i>
      </span>
      <span className="atu-orbit-label">Océan Indien</span>
      {markets.map((m, i) => (
        <span
          key={m.name}
          className={"atu-orbit-pill" + (m.center ? " is-centered" : "")}
          style={{ "--x": m.x, "--y": m.y, "--k": i } as React.CSSProperties}
        >
          {m.name}
        </span>
      ))}
    </div>
  );
}

const CARDS: Card[] = [
  {
    id: "international",
    tone: "teal",
    title: ["ANCRÉS DANS L'OCÉAN", "INDIEN, CALIBRÉS POUR", "L'INTERNATIONAL."],
    pills: ["français", "anglais", "allemand", "italien"],
    text: "Nous produisons en français, anglais, allemand et italien, et nous ciblons vos marchés émetteurs réels: Europe, Afrique australe, Golfe, Inde, Asie.",
    panel: <Orbit />,
    pos: { dx: -464, rot: -3 },
  },
  {
    id: "studio",
    tone: "magenta",
    title: ["UN STUDIO INTÉGRÉ QUI SE", "DÉPLACE."],
    pills: ["Photo", "Vidéo", "Drone", "Montage"],
    text: "Photo, vidéo, drone, montage : nous venons chez vous. Pas de production sous-traitée à l’autre bout du monde par des gens qui n’ont jamais vu votre lumière du matin",
    // eslint-disable-next-line @next/next/no-img-element
    panel: <img className="atu-img" src="/images/atouts/studio-projecteur.webp" alt="Projecteur de studio" loading="lazy" />,
    pos: { dx: 0, rot: 0 },
  },
  {
    id: "techno",
    tone: "gray",
    title: ["UNE BRIQUE", "TECHNOLOGIQUE", "PROPRIÉTAIRE."],
    text: "Nos agents IA et nos automatisations sont conçus pour l’hôtellerie, connectés à vos outils existants : PMS, moteur de réservation, plateformes d’avis, WhatsApp.",
    panel: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="atu-img"
        src="/images/atouts/brique-techno-puce.webp"
        alt="Puce reliée au PMS, au moteur de réservation, aux plateformes d’avis et à WhatsApp"
        loading="lazy"
      />
    ),
    pos: { dx: 464, rot: 3 },
  },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Strengths() {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const sec = secRef.current!;
    const stage = stageRef.current!;
    const path = pathRef.current!;
    const grad = gradRef.current!;
    const svg = path.ownerSVGElement!;
    const cards = Array.from(sec.querySelectorAll<HTMLElement>(".atu-card"));
    const mq = matchMedia("(max-width: 900px)");
    const still = prefersReducedMotion();
    let samples: { l: number; y: number }[] = [];
    let total = 1;

    /* ligne de la scène : prolonge exactement la ligne de « Pourquoi » (même point, même direction),
       passe derrière la carte du milieu, traverse l'espace entre les cartes 2 et 3,
       ressort sous la 3e carte vers les destinations (x 1121). */
    const layout = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || mq.matches) return;
      const j = W / 1440;
      const a = cards[0].offsetWidth / 421;
      const c2 = cards[1];
      const c3 = cards[2];
      const cy = c2.offsetTop + c2.offsetHeight / 2;
      const gx = (c2.offsetLeft + c2.offsetWidth + c3.offsetLeft) / 2;
      // raccord exact avec la ligne de « Pourquoi » : même point (684,7 ; 813,5) et même direction
      const sx = 684.72 * j;
      // raccord exact avec la ligne des destinations : point (1120,5 ; 3621) et même direction
      const ex = 1120.53 * j;
      const bx = 0.3794;
      const by = 0.9252;
      const tx = -0.6693;
      const ty = 0.743;
      const L = 170 * j;
      const f = (v: number) => v.toFixed(1);
      path.setAttribute(
        "d",
        `M${f(sx - tx * 12 * j)} ${f(-ty * 12 * j)} L${f(sx)} 0 ` +
          `C${f(sx + tx * L)} ${f(ty * L)} ${f(gx - 70 * a)} ${f(cy - 150 * a)} ${f(gx)} ${f(cy)} ` +
          `C${f(gx + 70 * a)} ${f(cy + 150 * a)} ${f(ex - bx * L)} ${f(H - by * L)} ${f(ex)} ${f(H)} ` +
          `L${f(ex + bx * 12 * j)} ${f(H + by * 12 * j)}`
      );
      path.style.strokeWidth = String(22 * j);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      grad.setAttribute("x2", String(W));
      total = path.getTotalLength();
      samples = [];
      for (let i = 0; i <= 200; i++) {
        const l = (total * i) / 200;
        samples.push({ l, y: path.getPointAtLength(l).y });
      }
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      if (mq.matches || still) {
        cards.forEach((c) => c.style.setProperty("--t", "1"));
        path.style.strokeDashoffset = "0";
        return;
      }
      const vh = innerHeight;
      const r = sec.getBoundingClientRect();
      // 0 : la scène commence à monter dans l'écran ; 1 : fin de la partie fixée
      const lead = vh * 0.35;
      const p = clamp((lead - r.top) / (r.height - vh + lead));
      cards.forEach((c, i) => c.style.setProperty("--t", ease(clamp((p - i * 0.22) / 0.42)).toFixed(4)));
      // ligne dessinée jusqu'aux trois quarts de l'écran (comme le reste du parcours)
      const target = vh * 0.75 - stage.getBoundingClientRect().top;
      let drawn = 0;
      for (const s of samples) if (s.y <= target) drawn = s.l;
      path.style.strokeDashoffset = String(1 - drawn / total);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      layout();
      onScroll();
    };
    layout();
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="atu" id="atouts" aria-label="Nos atouts" ref={secRef}>
      <div className="atu-stage" ref={stageRef}>
        <svg className="atu-line" aria-hidden="true">
          <defs>
            {/* même dégradé que la ligne du parcours : vert à gauche → jaune à droite */}
            <linearGradient ref={gradRef} id="atuGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0" stopColor="#64a586" />
              <stop offset="1" stopColor="#e3bd34" />
            </linearGradient>
          </defs>
          <path ref={pathRef} pathLength={1} />
        </svg>
        {CARDS.map((c) => (
          <article
            key={c.id}
            className={"atu-card atu-card--" + c.tone}
            style={{ "--dx": c.pos.dx, "--rot": c.pos.rot + "deg" } as React.CSSProperties}
          >
            <div className="atu-panel">{c.panel}</div>
            <h3 className="atu-title">
              {c.title.map((l, i) => (
                <span key={i}>
                  {l}
                  {i < c.title.length - 1 ? " " : ""}
                </span>
              ))}
            </h3>
            {c.pills && (
              <ul className="atu-pills">
                {c.pills.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            <p className="atu-text">{c.text}</p>
            <span className="atu-dot" aria-hidden="true"></span>
          </article>
        ))}
      </div>
    </section>
  );
}
