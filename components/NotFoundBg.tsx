"use client";

import GlowField, { type Glow } from "./GlowField";
import Fireflies from "./Fireflies";

/** fond de la page 404 : halos jaune doré / rose / bleu ca et lucioles (comme Contact et maintenance) */
const GLOWS: Glow[] = [
  { x: 1150, y: 160, rx: 620, ry: 540, c: "247, 194, 39", a: 0.5, dx: 90, dy: 60, sp: 0.4, m: -40 },
  { x: 900, y: 780, rx: 620, ry: 520, c: "222, 11, 125", a: 0.55, dx: 120, dy: 60, sp: 0.35, ph: 2, m: 30 },
  { x: 60, y: 120, rx: 460, ry: 420, c: "62, 157, 158", a: 0.32, dx: 80, dy: 50, sp: 0.3, ph: 4, m: 20 },
];
const left = (_i: number, r: (a: number, b: number) => number) => r(2, 98);
const top = (_i: number, r: (a: number, b: number) => number) => r(10, 96);

export default function NotFoundBg() {
  return (
    <>
      <GlowField glows={GLOWS} breath={0.8} />
      <Fireflies className="nf-fireflies" count={18} left={left} top={top} />
    </>
  );
}
