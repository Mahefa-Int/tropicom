"use client";

import { useEffect, useState } from "react";
import { SwipeCards } from "@/components/ui/image-stack-carousel";

/**
 * « Pourquoi Tropi'Com » — après les témoignages.
 * Maquette (ramenée à 1440 de large comme les autres sections) : étiquette, phrase d'accroche,
 * icône « graphic point », ligne verte → citron qui traverse la scène, et une pile de cartes penchées.
 * Pile = Image Stack Carousel (components/ui/image-stack-carousel.tsx) : on tire la carte de devant
 * (inclinaison 3D) et elle repasse sous la pile.
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

/** Taille des cartes : 568 × 381 px de maquette (ramenée à 1440) ; sur mobile, toute la largeur. */
function useCardSize() {
  const [size, setSize] = useState({ w: 568, h: 381, mobile: false });
  useEffect(() => {
    const update = () => {
      const vw = document.documentElement.clientWidth;
      if (vw <= 900) setSize({ w: Math.min(420, vw - 40), h: Math.min(560, Math.round((vw - 40) * 1.35)), mobile: true });
      else setSize({ w: Math.round((568 * vw) / 1440), h: Math.round((381 * vw) / 1440), mobile: false });
    };
    update();
    addEventListener("resize", update);
    return () => removeEventListener("resize", update);
  }, []);
  return size;
}

function ReasonCard({ r }: { r: Reason }) {
  return (
    <article className="why-card" style={{ "--glow": r.glow } as React.CSSProperties}>
      <span className="why-card-glow" aria-hidden="true"></span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="why-card-img" src={r.image} alt="" loading="lazy" draggable={false} />
      <h3 className="why-card-title">{r.title}</h3>
      <p className="why-card-text">{r.text}</p>
    </article>
  );
}

export default function Why() {
  const size = useCardSize();

  return (
    <section className="why" id="pourquoi" data-reveal aria-labelledby="why-title">
      {/* ligne verte → citron (derrière les cartes) */}
      <svg className="why-line" viewBox="0 0 1440 699" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="whyGrad" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="760" y2="699">
            <stop offset="0" stopColor="#5fa586" />
            <stop offset="0.55" stopColor="#8fb06a" />
            <stop offset="1" stopColor="#c3cf55" />
          </linearGradient>
        </defs>
        <path pathLength={1} d="M-20 154 C 190 205 330 250 520 300 C 760 365 880 480 800 600 C 785 625 770 650 745 699" />
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

      {/* pile de cartes : penchée comme sur la maquette ; tirez la carte de devant */}
      <div className="why-cards">
        <SwipeCards
          key={size.mobile ? "m" : "d"}
          className="why-stack"
          cards={REASONS.map((r, i) => ({ id: i, content: <ReasonCard r={r} /> }))}
          settings={{
            width: size.w,
            height: size.h,
            radius: size.mobile ? 22 : Math.round((26 * size.w) / 568),
            stackRotation: size.mobile ? -4 : -3,
            stackScale: 0.03,
            stackOrigin: "15% 85%",
            swipeThreshold: 110,
            tiltStrength: 18,
            mobileScale: 1,
            background: "#050505",
          }}
        />
        <p className="why-hint" aria-hidden="true">
          Faites glisser la carte
        </p>
      </div>
    </section>
  );
}
