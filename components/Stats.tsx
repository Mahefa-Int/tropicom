"use client";

import { useEffect, useRef } from "react";

const STATS = [
  { label: "clients accompagnés", value: 40 },
  { label: "projets menés", value: 1000 },
  { label: "contenus créés", value: 900 },
  { label: "membres d’équipes", value: 15 },
];

/** Chiffres clés : les cartes montent une à une et les nombres comptent de 0 à leur valeur. */
export default function Stats() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const nums = [...section.querySelectorAll<HTMLElement>(".stat-num [data-value]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const count = () => {
      const start = performance.now();
      const tick = (now: number) => {
        let done = true;
        nums.forEach((el, i) => {
          const delay = i * 120 + 250;          // même cascade que l'apparition des cartes
          const p = Math.min(Math.max((now - start - delay) / 1600, 0), 1);
          if (p < 1) done = false;
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = String(Math.round(eased * Number(el.dataset.value)));
        });
        if (!done) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          section.classList.add("in-view");
          if (!reduce) count();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (!reduce) nums.forEach((el) => (el.textContent = "0"));
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="stats" id="chiffres" ref={ref} aria-label="Tropi'Com en chiffres">
      {STATS.map((s, i) => (
        <div className="stat" key={s.label} style={{ "--i": i } as React.CSSProperties}>
          <p className="stat-label">{s.label}</p>
          <p className="stat-num">
            +<span data-value={s.value}>{s.value}</span>
          </p>
        </div>
      ))}
    </section>
  );
}
