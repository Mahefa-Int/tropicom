"use client";

import { Fragment, useEffect, useRef } from "react";
import CtaIcon from "./CtaIcon";
import { SERVICES } from "@/lib/services";

/** Texte avec retours à la ligne (« \n ») : <br/> précédé d'une espace pour le mobile. */
function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 && (
            <>
              {" "}
              <br />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}

const PATH =
  "M 350 560 C 350 700 350 820 351 900 C 352 1100 400 1380 470 1600 C 560 1880 760 2130 900 2196 " +
  "C 1080 2280 1240 2265 1236 2312 C 1232 2370 1060 2400 880 2470 C 600 2600 380 2770 300 2895 " +
  "C 200 3030 260 3300 600 3450 C 760 3530 900 3560 1000 3600 C 1200 3680 1350 3760 1460 3870";

export default function Services() {
  const svcRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const svc = svcRef.current;
    if (!svc) return;
    const path = svc.querySelector<SVGPathElement>(".svc-path")!;
    const tip = svc.querySelector<SVGCircleElement>(".svc-tip")!;
    const cards = [...svc.querySelectorAll<HTMLElement>(".svc-card")];
    const countCur = svc.querySelector<HTMLElement>(".svc-count .cur")!;
    const countBar = svc.querySelector<HTMLElement>(".svc-count .bar")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const len = path.getTotalLength();

    // échantillons (longueur → y) : la ligne descend toujours, on retrouve la longueur pour un y donné
    const samples: [number, number][] = [];
    for (let i = 0; i <= 600; i++) {
      const l = (len * i) / 600;
      samples.push([l, path.getPointAtLength(l).y]);
    }
    const lengthAtY = (y: number) => {
      if (y <= samples[0][1]) return 0;
      for (let i = 1; i < samples.length; i++) {
        if (samples[i][1] >= y) {
          const [l0, y0] = samples[i - 1];
          const [l1, y1] = samples[i];
          return l0 + ((l1 - l0) * (y - y0)) / Math.max(y1 - y0, 0.001);
        }
      }
      return len;
    };
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(reduce ? 0 : len);

    // arrivée des cartes
    const cardIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            cardIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => (reduce ? c.classList.add("in") : cardIo.observe(c)));

    let ticking = false;
    const update = () => {
      ticking = false;
      const r = svc.getBoundingClientRect();
      const scale = r.width / 1440;
      const mark = innerHeight * 0.62; // point de l'écran que suit la ligne
      const y = (mark - r.top) / scale; // en coordonnées de la maquette
      if (!reduce) {
        const l = lengthAtY(y);
        path.style.strokeDashoffset = String(len - l);
        const p = path.getPointAtLength(l);
        tip.setAttribute("cx", String(p.x));
        tip.setAttribute("cy", String(p.y));
        svc.classList.toggle("drawing", l > 0 && l < len - 1);
      }
      // cartes atteintes = allumées ; la plus proche du centre de l'écran = « current »
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        c.classList.toggle("lit", reduce || cr.top < mark);
        const d = Math.abs(cr.top + cr.height / 2 - innerHeight / 2);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      cards.forEach((c, i) => c.classList.toggle("current", i === best));
      countCur.textContent = String(best + 1).padStart(2, "0");
      countBar.style.setProperty("--p", String((best + 1) / cards.length));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();

    // bulle « VOIR » + léger décalage de l'image qui suivent la souris
    // (position mise à jour une fois par image ; dès l'entrée, pour que la bulle n'apparaisse pas dans le coin)
    const cleanups: (() => void)[] = [];
    svc.querySelectorAll<HTMLElement>(".svc-img").forEach((box) => {
      let ev: MouseEvent | null = null;
      const place = () => {
        const e = ev;
        ev = null;
        if (!e) return;
        const b = box.getBoundingClientRect();
        box.style.setProperty("--vx", e.clientX - b.left + "px");
        box.style.setProperty("--vy", e.clientY - b.top + "px");
        box.style.setProperty("--mx", ((e.clientX - b.left) / b.width - 0.5).toFixed(3));
        box.style.setProperty("--my", ((e.clientY - b.top) / b.height - 0.5).toFixed(3));
      };
      const enter = (e: MouseEvent) => {
        ev = e;
        place();
      };
      const move = (e: MouseEvent) => {
        if (!ev) requestAnimationFrame(place);
        ev = e;
      };
      const leave = () => {
        box.style.setProperty("--mx", "0");
        box.style.setProperty("--my", "0");
      };
      box.addEventListener("mouseenter", enter);
      box.addEventListener("mousemove", move);
      box.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        box.removeEventListener("mouseenter", enter);
        box.removeEventListener("mousemove", move);
        box.removeEventListener("mouseleave", leave);
      });
    });

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cardIo.disconnect();
      cleanups.forEach((f) => f());
    };
  }, []);

  return (
    <section className="svc" id="expertises" ref={svcRef}>
      {/* Ligne qui relie les cartes : se dessine au scroll (magenta → doré → bleu canard) */}
      <svg className="svc-line" viewBox="0 0 1440 4208" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="svcGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="4208">
            <stop offset="0" stopColor="#de0b7d" />
            <stop offset="0.38" stopColor="#de0b7d" />
            <stop offset="0.511" stopColor="#a07d1c" />
            <stop offset="0.547" stopColor="#473609" />
            <stop offset="0.587" stopColor="#7e6314" />
            <stop offset="0.684" stopColor="#256161" />
            <stop offset="0.713" stopColor="#266262" />
            <stop offset="0.846" stopColor="#193c3d" />
            <stop offset="0.92" stopColor="#081617" />
          </linearGradient>
        </defs>
        <path className="svc-path" d={PATH} />
        <circle className="svc-tip" r="9" cx="350" cy="560" />
      </svg>

      {/* Panneau « 05 EXPERTISES » : reste visible pendant le défilement des cartes */}
      <div className="svc-aside">
        <div className="svc-panel">
          {/* Image : /images/services-badge-expert.png — l'anneau de texte tourne, le centre reste fixe */}
          <div className="svc-badge" aria-hidden="true">
            <span className="ring"></span>
            <span className="core"></span>
          </div>
          <p className="svc-kicker">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/traits-jaunes.png" alt="" width={62} height={28} />
            <span>
              Services professionnels<sup>®</sup>
            </span>
          </p>
          <h2 className="svc-heading">
            <span className="big">05</span> EXPERTISES.
          </h2>
          <p className="svc-sub">
            Un seul objectif : la réservation
            <br />
            directe.
          </p>
          <p className="svc-text">
            Vous pouvez nous confier un chantier précis ou
            <br />
            l’ensemble du dispositif. Dans les deux cas, chaque
            <br />
            livrable est jugé sur ce qu’il rapporte, pas sur ce qu’il
            <br />
            coûte.
          </p>
          <p className="svc-count" aria-hidden="true">
            <span className="cur">01</span>
            <span className="bar">
              <i></i>
            </span>
            <span>05</span>
          </p>
          <a href="#" className="cta svc-btn">
            <CtaIcon />
            <span className="cta-label">Découvrir plus</span>
          </a>
        </div>
      </div>

      <div className="svc-cards">
        {SERVICES.map((s, i) => (
          <article
            key={s.n}
            className={`svc-card${s.title.includes("\n") ? " svc-card--2l" : ""}`}
            style={
              {
                "--i": i,
                "--r": `${s.rotate}deg`,
                "--accent": s.accent,
                "--img-y": s.imgY,
                "--lead-y": s.leadY,
                "--desc-y": s.descY,
                "--tags-x": s.tagsX,
                "--tags-y": s.tagsY,
              } as React.CSSProperties
            }
          >
            <h3 className="svc-title">
              <span className="svc-num">{s.n}./</span>
              <span className="svc-name">
                <Lines text={s.title} />
              </span>
            </h3>
            <div className="svc-imgs">
              {s.images.map((img) => (
                <div className="svc-img" key={img.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.position ?? "center" }} />
                  <span className="svc-voir" aria-hidden="true">
                    VOIR
                  </span>
                </div>
              ))}
            </div>
            <p className="svc-lead">{s.lead}</p>
            <p className="svc-desc">
              <Lines text={s.desc} />
            </p>
            <div className="svc-tags">
              {s.tags.map((row, k) => (
                <p key={k}>
                  {row.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
              ))}
            </div>
            <span className="svc-dot" aria-hidden="true"></span>
          </article>
        ))}
      </div>
    </section>
  );
}
