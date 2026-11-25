"use client";

import { useEffect, useRef, useState } from "react";
import type { Expertise } from "@/lib/expertises";
import type { ExpertiseContent, Stat } from "@/lib/expertises-content";
import { pad2 } from "@/lib/expertises";
import { prefersReducedMotion } from "@/lib/motion";
import GlowField, { type Glow } from "./GlowField";

/**
 * Page d'une expertise.
 * 1. Ouverture plein écran : très grand numéro du pôle en contour, titre géant (fin en jaune doré), texte,
 *    les deux photos du pôle qui flottent et suivent légèrement la souris, halos aux couleurs du pôle.
 * 2. La liste (livrables, modules, briques…) : rangées aérées ; au survol, une photo du pôle apparaît dans la colonne de droite.
 * 3. Rubriques propres au pôle : mise en avant + chiffres qui défilent, indicateurs, listes, « inclus », étapes.
 */

/** chiffre qui défile jusqu'à sa valeur quand il entre dans l'écran (« 300+ », « 24/7 », « 10 s » : la partie numérique défile) */
function Count({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const [shown, setShown] = useState(m ? `${m[1]}0${m[3]}` : value);
  useEffect(() => {
    if (!m) return;
    const el = ref.current!;
    const target = +m[2];
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / 1400);
        const k = 1 - (1 - t) ** 3;
        setShown(`${m[1]}${Math.round(target * k)}${m[3]}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <b ref={ref}>{shown}</b>;
}

function Stats({ stats }: { stats: Stat[] }) {
  return (
    <ul className="xd-stats">
      {stats.map((s) => (
        <li key={s.label}>
          <Count value={s.value} />
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ExpertiseDetail({ e, c }: { e: Expertise; c: ExpertiseContent }) {
  const heroRef = useRef<HTMLElement>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const glows: Glow[] = [
    { x: 1260, y: 160, rx: 560, ry: 520, c: c.glow[0], a: 0.5, dx: 90, dy: 60, sp: 0.4, m: -40 },
    { x: 120, y: 760, rx: 520, ry: 420, c: c.glow[1], a: 0.32, dx: 110, dy: 50, sp: 0.35, ph: 2, m: 30 },
  ];

  // haut de page : apparition, photos qui suivent la souris (profondeurs différentes)
  useEffect(() => {
    const hero = heroRef.current!;
    const t = setTimeout(() => hero.classList.add("in-view"), 60);
    if (prefersReducedMotion()) return () => clearTimeout(t);
    const imgs = Array.from(hero.querySelectorAll<HTMLElement>(".xd-shot"));
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      imgs.forEach((el, i) => el.style.setProperty("--m", `${(mx * (14 + i * 16)).toFixed(1)}px ${(my * (10 + i * 12)).toFixed(1)}px`));
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      const r = hero.getBoundingClientRect();
      mx = (ev.clientX - r.left) / r.width - 0.5;
      my = (ev.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    hero.addEventListener("pointermove", move);
    return () => {
      clearTimeout(t);
      hero.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  // aperçu au survol de la liste : dans la colonne de droite réservée, il suit la souris en hauteur seulement
  useEffect(() => {
    const el = prevRef.current!;
    const list = document.querySelector<HTMLElement>(".xd-list");
    if (!list || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    let ty = 0;
    let y = 0;
    let raf = 0;
    let first = true;
    const place = () => {
      const r = list.getBoundingClientRect();
      el.style.left = `${r.right - el.offsetWidth}px`;
    };
    const tick = () => {
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (ev: PointerEvent) => {
      ty = ev.clientY;
      if (first) {
        y = ty;
        first = false;
      }
      place();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", place);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("resize", place);
      cancelAnimationFrame(raf);
    };
  }, []);

  const titleLines = (c.title.lead + "\u0000" + c.title.gold).split("\n");

  return (
    <article className="xd">
      {/* ---------- 1. ouverture ---------- */}
      <header className="xd-hero" ref={heroRef}>
        <GlowField glows={glows} breath={0.6} />
        <span className="xd-big" aria-hidden="true">
          {pad2(e.n)}
        </span>
        <nav className="xd-crumb" aria-label="Fil d’Ariane">
          <a href="/expertises">
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M10 6H2.5M5.5 3 2.5 6l3 3" />
            </svg>
            Expertises
          </a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{e.label}</span>
        </nav>
        <div className="xd-hero-text">
          <p className="xd-kicker">
            <b>Pôle {pad2(e.n)}</b>
            {e.full}
          </p>
          <h1 className="xd-title">
            {titleLines.map((line, i) => {
              const [white, gold] = line.split("\u0000");
              return (
                <span className="xd-l" key={i} style={{ "--i": i } as React.CSSProperties}>
                  <span>
                    {white}
                    {gold !== undefined && <em>{gold}</em>}
                  </span>
                </span>
              );
            })}
          </h1>
          <p className="xd-intro">{c.intro}</p>
          <a href="#xd-list" className="xd-down">
            <span>Découvrir</span>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
            </svg>
          </a>
        </div>
        <div className="xd-shots" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="xd-shot xd-shot--arch" src={c.images[0]} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="xd-shot xd-shot--leaf" src={c.images[1]} alt="" />
        </div>
      </header>

      {/* ---------- 2. la liste ---------- */}
      <section className="xd-sec" id="xd-list" aria-labelledby="xd-list-t">
        <h2 className="xd-h2" id="xd-list-t" data-reveal>
          {c.listTitle}
        </h2>
        <ol className="xd-list" onPointerLeave={() => setHover(null)}>
          {c.items.map((it, i) => (
            <li key={it.title} data-on={hover === i || undefined} onPointerEnter={(ev) => ev.pointerType === "mouse" && setHover(i)} data-reveal>
              <span className="xd-list-n">{pad2(i + 1)}</span>
              <span className="xd-list-t">
                {it.title}
                {it.meta && <small>{it.meta}</small>}
              </span>
              {it.text && <span className="xd-list-d">{it.text}</span>}
            </li>
          ))}
        </ol>
      </section>
      <div className={"xd-preview" + (hover !== null ? " is-on" : "")} ref={prevRef} aria-hidden="true">
        <div className="xd-preview-in">
          {c.images.map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={hover !== null && hover % 2 === k ? "is-cur" : undefined} />
          ))}
        </div>
      </div>

      {/* ---------- 3. rubriques propres au pôle ---------- */}
      {c.feature && (
        <section className="xd-sec" aria-labelledby="xd-feat-t">
          <div className="xd-feature" data-reveal>
            <p className="xd-feature-k">{c.feature.kicker}</p>
            <h2 id="xd-feat-t">{c.feature.title}</h2>
            <p className="xd-feature-p">{c.feature.text}</p>
            {c.feature.note && <p className="xd-feature-note">{c.feature.note}</p>}
            <Stats stats={c.feature.stats} />
          </div>
        </section>
      )}
      {c.stats && (
        <section className="xd-sec" aria-label="Chiffres clés" data-reveal>
          <Stats stats={c.stats} />
        </section>
      )}
      {c.pills && (
        <section className="xd-sec" aria-labelledby="xd-pills-t">
          <h2 className="xd-h2" id="xd-pills-t" data-reveal>
            {c.pills.title}
          </h2>
          <div className="xd-marquee" data-reveal>
            {[0, 1].map((k) => (
              <ul key={k} aria-hidden={k === 1 || undefined}>
                {c.pills!.items.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ))}
          </div>
        </section>
      )}
      {(c.lists || c.included) && (
        <section className="xd-sec xd-cols">
          {c.lists?.map((l) => (
            <div key={l.title} className="xd-box" data-reveal>
              <h2 className="xd-box-t">{l.title}</h2>
              <ul className={"xd-box-list" + (l.checks ? " is-checks" : "")}>
                {l.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
          {c.included && (
            <div className="xd-box xd-box--inc" data-reveal>
              <h2 className="xd-box-t">{c.included.title}</h2>
              <p>{c.included.text}</p>
            </div>
          )}
        </section>
      )}
      {c.steps && (
        <section className="xd-sec" aria-labelledby="xd-steps-t">
          <h2 className="xd-h2" id="xd-steps-t" data-reveal>
            {c.steps.title}
          </h2>
          <ol className="xd-steps" data-reveal>
            {c.steps.items.map((s, i) => (
              <li key={s} style={{ "--i": i } as React.CSSProperties}>
                <b>{pad2(i + 1)}</b>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

    </article>
  );
}
