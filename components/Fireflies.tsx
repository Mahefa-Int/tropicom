"use client";

import { useEffect, useRef } from "react";

type Props = {
  className: string;
  count?: number;
  /** position horizontale (en %) de la luciole n° i */
  left: (i: number, r: (min: number, max: number) => number) => number;
  /** position verticale (en %) de la luciole n° i */
  top: (i: number, r: (min: number, max: number) => number) => number;
};

/**
 * Lucioles générées côté navigateur (positions aléatoires) :
 * on les crée après le chargement pour éviter un rendu différent entre serveur et navigateur.
 */
export default function Fireflies({ className, count = 25, left, top }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const f2 = (n: number) => n.toFixed(2);
    for (let i = 0; i < count; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = f2(left(i, r)) + "%";
      f.style.top = f2(top(i, r)) + "%";
      f.style.setProperty("--s", f2(r(2, 4)) + "px");
      f.style.setProperty("--d", f2(r(6, 12)) + "s");
      f.style.setProperty("--delay", f2(r(0, 8)) + "s");
      f.style.setProperty("--dx", f2(r(-30, 30)) + "px");
      box.appendChild(f);
    }
    return () => {
      box.innerHTML = "";
    };
  }, [count, left, top]);

  return <div ref={ref} className={className} aria-hidden="true"></div>;
}
