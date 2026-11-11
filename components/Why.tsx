"use client";

import { useEffect, useRef } from "react";

/**
 * « Pourquoi Tropi'Com » — après les témoignages.
 * Maquette (ramenée à 1440 de large comme les autres sections) : étiquette, phrase d'accroche,
 * icône « graphic point », ligne verte → citron qui traverse la scène, et un paquet de cartes penchées.
 * Au défilement, la scène reste épinglée : la carte du dessus s'envole le long de la ligne
 * et révèle la suivante ; la ligne se dessine en même temps.
 * À COMPLÉTER : titres, textes et images des cartes 2 et 3 (provisoires).
 */
type Reason = { title: string; text: string; image: string; glow: string };

const REASONS: Reason[] = [
  {
    title: "100 % tourisme et hospitalité.",
    text: "Nous ne servons pas de banques ni de télécoms. Nous connaissons la saisonnalité, le lead time de réservation, le poids d’un avis, la différence entre un lodge et un city hotel.",
    image: "/images/pourquoi/cloche-hotel.webp",
    glow: "rgba(222, 11, 125, 0.75)",
  },
  {
    // PROVISOIRE
    title: "Vos marchés émetteurs, de l’intérieur.",
    text: "France, Europe, océan Indien : nous savons quand vos voyageurs réservent, sur quels canaux ils comparent et ce qui les décide à réserver chez vous plutôt que sur une plateforme.",
    image: "/images/pourquoi/cloche-hotel.webp",
    glow: "rgba(62, 157, 158, 0.8)",
  },
  {
    // PROVISOIRE
    title: "Jugés sur vos réservations directes.",
    text: "Chaque action est mesurée sur ce qu’elle rapporte : taux d’occupation, part de réservations en direct, commissions économisées. Pas sur le nombre de publications.",
    image: "/images/pourquoi/cloche-hotel.webp",
    glow: "rgba(247, 194, 39, 0.7)",
  },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function Why() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const path = pathRef.current;
    if (!root || !stage || !path) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 900px)");
    const n = REASONS.length;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);

    const target = () => {
      const r = root.getBoundingClientRect();
      const run = r.height - stage.offsetHeight;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      return run > 0 ? clamp01((top - r.top) / run) : 0;
    };
    let v = target();

    const place = () => {
      if (mobile.matches) {
        cardRefs.current.forEach((el) => el && (el.style.cssText = ""));
        path.style.strokeDashoffset = "0";
        return;
      }
      // la ligne : à moitié dessinée à l'arrivée, entière à la fin
      path.style.strokeDashoffset = String(len * (1 - (reduce ? 1 : 0.6 + 0.4 * v)));
      const pos = v * (n - 1); // carte au-dessus du paquet (fractionnaire pendant le passage)
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const k = i - pos; // < 0 : déjà partie ; 0 : dessus ; > 0 : dessous
        if (k < 0) {
          // s'envole vers le haut à gauche, le long de la ligne, en tournant
          const t = ease(clamp01(-k));
          el.style.transform =
            "translate3d(" + (-62 * t).toFixed(2) + "vw," + (-38 * t).toFixed(2) + "vh,0) rotateY(-8deg) rotateZ(" + (4.5 - 16 * t).toFixed(2) + "deg)";
          el.style.opacity = Math.max(0, 1 - t * 1.5).toFixed(3);
          el.style.setProperty("--why-dim", "0");
        } else {
          // dans le paquet : un peu décalée, plus penchée, plus petite et plus sombre
          const d = Math.min(k, 2);
          el.style.transform =
            "translate3d(" + (d * -0.9).toFixed(2) + "vw," + (d * 1.2).toFixed(2) + "vh,0) rotateY(-8deg) rotateZ(" + (4.5 - d * 1.6).toFixed(2) + "deg) scale(" + (1 - d * 0.02).toFixed(3) + ")";
          el.style.opacity = "1";
          el.style.setProperty("--why-dim", Math.min(1, d).toFixed(3));
        }
        el.style.zIndex = String(10 + n - i);
      });
    };

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = target();
      v += (t - v) * (reduce ? 1 : 0.14);
      if (Math.abs(t - v) < 1e-4) v = t;
      place();
    };
    place();
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf);
        if (e.isIntersecting) raf = requestAnimationFrame(tick);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(root);
    const onMq = () => place();
    mobile.addEventListener("change", onMq);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mobile.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <section className="why" id="pourquoi" ref={rootRef} aria-labelledby="why-title">
      {/* data-reveal sur la scène (la section fait 3 écrans de haut) */}
      <div className="why-stage" ref={stageRef} data-reveal>
        {/* ligne verte → citron (derrière les cartes) */}
        <svg className="why-line" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="whyGrad" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="760" y2="900">
              <stop offset="0" stopColor="#5fa586" />
              <stop offset="0.55" stopColor="#8fb06a" />
              <stop offset="1" stopColor="#c3cf55" />
            </linearGradient>
          </defs>
          <path ref={pathRef} d="M-20 154 C 190 205 330 250 520 300 C 760 365 880 480 800 600 C 770 645 750 680 715 745 C 680 810 655 860 630 900" />
        </svg>

        <p className="why-tag">
          <span className="dot" aria-hidden="true"></span>Pourquoi Tropi’Com
        </p>
        <h2 className="why-title" id="why-title">
          Une agence qui connaît vos marchés{" "}
          <br />
          émetteurs autant que vos contraintes de{" "}
          <br />
          terrain.
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="why-traits" src="/images/graphic-point.png" alt="" width={64} height={32} />

        <ol className="why-cards">
          {REASONS.map((r, i) => (
            <li
              key={i}
              className="why-card"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{ "--glow": r.glow } as React.CSSProperties}
            >
              <span className="why-card-glow" aria-hidden="true"></span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="why-card-img" src={r.image} alt="" loading="lazy" />
              <h3 className="why-card-title">{r.title}</h3>
              <p className="why-card-text">{r.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
