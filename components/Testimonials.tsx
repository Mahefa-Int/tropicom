"use client";

import { useEffect, useRef } from "react";

/**
 * « Nos clients en parlent » — avis clients (après les 5 temps).
 * Les cartes défilent en continu et en boucle dans une bande dont les bords se fondent dans le noir ;
 * elles ralentissent jusqu'à l'arrêt au survol (le temps de lire) et se laissent glisser
 * à la souris / au doigt. Au survol, un faisceau aux couleurs de la charte
 * (jaune doré → magenta → bleu canard) tourne autour de la carte (CSS, .tm-card::before / ::after).
 * Avatars : /images/temoignages/*.png (provisoires, découpés dans la maquette).
 */
type Review = {
  author: string;
  avatar: string;
  text: string; // « \n » = nouveau paragraphe
  date: string;
  isNew?: boolean;
};

const REVIEWS: Review[] = [
  {
    author: "ANDASIBE LEMURS LODGE",
    avatar: "/images/temoignages/andasibe-lemurs-lodge.png",
    text:
      "Une nouvelle expérience courte de 2 mois l’année 2024 qui nous a renforcé notre visibilité et notre présence. Nous sommes conscient de renouveler notre collaboration avec un autre établissement et de continuer notre collaboration durant cette nouvelle année 2025. je recommande vivement.",
    date: "il y a 8 mois",
  },
  {
    // À VÉRIFIER : la maquette indique « ANDASIBE LEMURS LODGE », mais le logo et le texte parlent de lendriko
    author: "ANDASIBE LEMURS LODGE",
    avatar: "/images/temoignages/client-2.png",
    text:
      "Une équipe très à l’écoute. Des idées très pertinentes et faciles à mettre en œuvre. Nous chez lendriko recommandons vivement cette boîte de communication. Surtout si vous évoluez dans le secteur du tourisme à Madagascar.\nMerci encore tropi com. Nous préparons notre stratégie pour cette année et reviendrons sûrement vous en parler dans pas longtemps. Merci à toute l’équipe !!",
    date: "il y a 2 jours",
    isNew: true,
  },
  {
    // À COMPLÉTER : texte coupé sur la maquette (les « … » marquent les passages manquants), et date
    author: "Valiha RABEMANANJARA",
    avatar: "/images/temoignages/valiha-rabemananjara.png",
    text:
      "Nous sommes ravis de partager notre satisfaction … conception du site web de notre Tour Opérateur, … côtés de l’agence Tropi’com.\nDès le début, nous avons bénéficié d’un accompagnement … et constant. Un grand merci à Jean Marc, le Web … expertise, la qualité de son travail et sa flexibilité … Nous remercions également Josceline, la Manager, … Developer, pour leur réactivité, leur efficacité et leur … au long du projet. Leur accompagnement nous a … défis et d’obtenir le résultat que nous espérions.",
    date: "",
  },
];

function Stars() {
  return (
    <span className="tm-stars" role="img" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5L7 14.3l-5.3-5 7.2-.9z" />
        </svg>
      ))}
    </span>
  );
}

const N = REVIEWS.length;
const SLIDES = [...REVIEWS, ...REVIEWS, ...REVIEWS]; // 3 copies → boucle sans fin
const SPEED = 42; // vitesse de défilement, en px de maquette par seconde

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sec = sectionRef.current;
    const track = trackRef.current;
    const list = listRef.current;
    if (!sec || !track || !list) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // largeur d'une série d'avis (N cartes + N écarts), mesurée sur la page
    let step = 0; // carte + écart
    const measure = () => {
      const s = list.children;
      step = (s[1] as HTMLElement).offsetLeft - (s[0] as HTMLElement).offsetLeft;
    };
    measure();
    // départ comme la maquette : 1re carte de la série du milieu calée à gauche de la bande
    let offset = N * step;
    const wrap = () => {
      const set = N * step;
      if (offset >= 2 * set) offset -= set;
      if (offset < set) offset += set;
    };
    const apply = () => {
      list.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0)`;
    };
    apply();

    let hover = false;
    let visible = false;
    let drag: { x: number; o: number; id: number; moved: boolean } | null = null;
    let v = 0; // vitesse actuelle (px/s), ralentit / repart en douceur

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = true;
    };
    const onLeave = () => {
      hover = false;
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { x: e.clientX, o: offset, id: e.pointerId, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        track.setPointerCapture(e.pointerId);
      }
      if (drag.moved) {
        offset = drag.o - dx;
        wrap();
        drag.o = offset + dx;
        apply();
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      drag = null;
    };
    const onResize = () => {
      const k = step ? offset / step : N;
      measure();
      offset = k * step;
      wrap();
      apply();
    };
    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    addEventListener("resize", onResize);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.05 });
    io.observe(sec);

    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (!visible || drag || reduce) {
        v = 0;
        return;
      }
      // vitesse proportionnelle à la taille des cartes (même rythme sur tous les écrans)
      const target = hover ? 0 : (SPEED * step) / 405;
      v += (target - v) * Math.min(1, dt * 3);
      if (Math.abs(v) < 0.01) return;
      offset += v * dt;
      wrap();
      apply();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="tm" id="temoignages" data-reveal aria-labelledby="tm-title" ref={sectionRef}>
      <h2 className="tm-title" id="tm-title">
        <span className="line">
          <span>NOS CLIENTS EN PARLENT</span>
        </span>
      </h2>
      <p className="tm-tag">
        <span className="dot" aria-hidden="true"></span>Témoignage
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="tm-traits" src="/images/graphic-point.png" alt="" width={64} height={32} />

      <div className="tm-track" ref={trackRef} aria-label="Avis clients">
        <ul className="tm-list" ref={listRef}>
          {SLIDES.map((r, k) => (
            <li
              className="tm-slide"
              key={k}
              aria-hidden={k < N || k >= 2 * N ? true : undefined}
              style={{ "--i": Math.max(0, Math.min(3, k - N)) } as React.CSSProperties}
            >
              <article className="tm-card">
                <svg className="tm-quote" viewBox="0 0 22 16" aria-hidden="true">
                  <path d="M0 0h10v10c0 3.4-2.6 5.6-9 6v-2.6c2.9-.4 4.3-1.5 4.6-3.4H0zM12 0h10v10c0 3.4-2.6 5.6-9 6v-2.6c2.9-.4 4.3-1.5 4.6-3.4H12z" />
                </svg>
                <blockquote className="tm-text">
                  {r.text.split("\n").map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </blockquote>
                <div className="tm-who">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.avatar} alt="" width={32} height={32} loading="lazy" draggable={false} />
                  <cite>{r.author}</cite>
                </div>
                <div className="tm-meta">
                  <Stars />
                  {r.date && <span className="tm-date">{r.date}</span>}
                  {r.isNew && <span className="tm-new">Nouveau</span>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
