"use client";

import { useEffect, useRef } from "react";
import { geoEquirectangular, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, geoRotation, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Globe des routes : continents en points, arcs de vol qui partent d'un point de départ (Antananarivo)
 * vers les marchés émetteurs, se dessinent l'un après l'autre puis recommencent.
 * Le globe se balance doucement autour de l'océan Indien ; on peut le faire tourner à la souris (ou au doigt),
 * il revient ensuite en douceur.
 * Dessin canvas 2D, projection orthographique (d3-geo), contours des terres : world-atlas 110m.
 */

export type GlobeTheme = {
  ground: string; // fond de la sphère
  land: string; // points des continents
  arc: string; // arcs et villes
  glow: string; // halo autour du globe
  hub?: string; // point de départ
};

export type Place = { name: string; lon: number; lat: number };

const TANA: Place = { name: "Antananarivo", lon: 47.52, lat: -18.88 };
const MARKETS: Place[] = [
  { name: "Paris", lon: 2.35, lat: 48.86 },
  { name: "Londres", lon: -0.13, lat: 51.5 },
  { name: "Francfort", lon: 8.68, lat: 50.11 },
  { name: "Milan", lon: 9.19, lat: 45.46 },
  { name: "Johannesburg", lon: 28.05, lat: -26.2 },
  { name: "Dubaï", lon: 55.27, lat: 25.2 },
  { name: "Mumbai", lon: 72.88, lat: 19.08 },
  { name: "Shanghai", lon: 121.47, lat: 31.23 },
];

export const NIGHT: GlobeTheme = {
  ground: "#101415",
  land: "rgba(84, 190, 191, 0.95)",
  arc: "#f7c227",
  glow: "rgba(62, 157, 158, 0.22)",
  hub: "#f7c227",
};

const DOT_STEP = 2.2; // espacement des points des continents (degrés)
const CENTER = -42; // le globe se balance autour de l'océan Indien (longitude 42° E au centre)
const SWAY = 28; // amplitude du balancement (degrés)
const TILT = -12; // inclinaison (on voit un peu plus l'hémisphère sud)
const CYCLE = 9; // durée d'un cycle d'arcs (s)

/** Points des continents : grille régulière sur la sphère, gardée là où il y a de la terre. */
function landDots(): [number, number][] {
  const W = 720;
  const H = 360;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topo, topo.objects.land);
  const proj = geoEquirectangular().fitSize([W, H], { type: "Sphere" });
  ctx.fillStyle = "#000";
  ctx.beginPath();
  geoPath(proj, ctx)(land);
  ctx.fill();
  const data = ctx.getImageData(0, 0, W, H).data;
  const out: [number, number][] = [];
  for (let lat = -84; lat <= 84; lat += DOT_STEP) {
    const step = DOT_STEP / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += step) {
      const x = Math.floor(((lon + 180) / 360) * W);
      const y = Math.floor(((90 - lat) / 180) * H);
      if (data[(y * W + x) * 4 + 3] > 128) out.push([lon, lat]);
    }
  }
  return out;
}

export default function RouteGlobe({
  theme = NIGHT,
  hub = TANA,
  places = MARKETS,
  className,
}: {
  theme?: GlobeTheme;
  hub?: Place;
  places?: Place[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const still = prefersReducedMotion();
    const dots = landDots();
    const graticule = geoGraticule10();
    // arcs : points intermédiaires sur le grand cercle, avec une hauteur qui dépend de la distance
    const arcs = places.map((p, i) => {
      const interp = geoInterpolate([hub.lon, hub.lat], [p.lon, p.lat]);
      const dist = geoDistance([hub.lon, hub.lat], [p.lon, p.lat]);
      const pts: { ll: [number, number]; h: number }[] = [];
      const n = 64;
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        pts.push({ ll: interp(t) as [number, number], h: Math.sin(Math.PI * t) * (0.04 + dist * 0.11) });
      }
      return { p, pts, delay: i * 0.45 };
    });

    let rot: [number, number, number] = [CENTER, TILT, 0];
    // décalage donné à la main, qui revient vers 0 après le lâcher
    let user: [number, number] = [0, 0];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let visible = true;
    let drag: { x: number; y: number; r: [number, number, number] } | null = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const draw = () => {
      const R = Math.min(w, h) * 0.44;
      const cx = w / 2;
      const cy = h / 2;
      const rotate = geoRotation(rot);
      // coordonnées écran + profondeur (z > 0 : face visible), avec une hauteur au-dessus du sol
      const P = (ll: [number, number], lift = 0) => {
        const [lon, lat] = rotate(ll);
        const l = (lon * Math.PI) / 180;
        const f = (lat * Math.PI) / 180;
        const s = R * (1 + lift);
        return { x: cx + s * Math.cos(f) * Math.sin(l), y: cy - s * Math.sin(f), z: Math.cos(f) * Math.cos(l), r: Math.cos(f) * Math.abs(Math.sin(l)) };
      };
      const shown = (q: { x: number; y: number; z: number }) => q.z > 0 || Math.hypot(q.x - cx, q.y - cy) > R;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
      halo.addColorStop(0, theme.glow);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // sphère (légère lumière en haut à gauche)
      const proj = geoOrthographic().scale(R).translate([cx, cy]).rotate(rot).clipAngle(90);
      const path = geoPath(proj, ctx);
      ctx.beginPath();
      path({ type: "Sphere" });
      const shade = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      shade.addColorStop(0, "rgba(255,255,255,0.07)");
      shade.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = theme.ground;
      ctx.fill();
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // méridiens / parallèles
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // continents en points (plus petits vers le bord)
      ctx.fillStyle = theme.land;
      const ds = Math.max(0.9, R / 105);
      for (const d of dots) {
        const q = P(d);
        if (q.z <= 0) continue;
        const s = ds * (0.45 + 0.55 * q.z);
        ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
      }

      // arcs
      const cyc = t % CYCLE;
      for (const a of arcs) {
        const local = cyc - a.delay;
        const grow = Math.min(1, Math.max(0, local / 1.6));
        const fade = cyc > CYCLE - 1.2 ? (CYCLE - cyc) / 1.2 : 1;
        if (grow <= 0) continue;
        const end = Math.floor(grow * (a.pts.length - 1));
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k <= end; k++) {
          const q = P(a.pts[k].ll, a.pts[k].h);
          if (!shown(q)) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(q.x, q.y);
          else ctx.moveTo(q.x, q.y);
          pen = true;
        }
        ctx.strokeStyle = theme.arc;
        ctx.globalAlpha = 0.85 * fade;
        ctx.lineWidth = Math.max(1, R / 140);
        ctx.stroke();
        // tête de l'arc (l'avion) puis la ville d'arrivée
        const head = P(a.pts[end].ll, a.pts[end].h);
        if (grow < 1 && shown(head)) {
          ctx.globalAlpha = fade;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(head.x, head.y, Math.max(1.4, R / 90), 0, Math.PI * 2);
          ctx.fill();
        }
        const city = P([a.p.lon, a.p.lat]);
        if (city.z > 0 && grow >= 1) {
          ctx.globalAlpha = fade;
          ctx.fillStyle = theme.arc;
          ctx.beginPath();
          ctx.arc(city.x, city.y, Math.max(1.5, R / 80), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // départ : Antananarivo, avec une onde
      const H = P([hub.lon, hub.lat]);
      if (H.z > 0) {
        const pulse = (t % 2) / 2;
        ctx.strokeStyle = theme.hub ?? theme.arc;
        ctx.globalAlpha = 1 - pulse;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(H.x, H.y, R / 60 + pulse * R / 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = theme.hub ?? theme.arc;
        ctx.beginPath();
        ctx.arc(H.x, H.y, Math.max(2, R / 55), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      if (!drag) {
        const back = 1 - Math.exp(-dt * 0.8);
        user = [user[0] * (1 - back), user[1] * (1 - back)];
      }
      rot = [CENTER + Math.sin(t * 0.22) * SWAY + user[0], TILT + user[1], 0];
      draw();
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && !still) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    if (still) {
      t = CYCLE - 1.3; // arcs tous dessinés
      draw();
    }
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    // rotation à la main
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, r: [user[0], user[1], 0] };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const k = 180 / (Math.min(w, h) * 0.9);
      user = [drag.r[0] + (e.clientX - drag.x) * k, Math.max(-50, Math.min(50, drag.r[1] - (e.clientY - drag.y) * k))];
      if (still) {
        rot = [CENTER + user[0], TILT + user[1], 0];
        draw();
      }
    };
    const onUp = () => (drag = null);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [theme, hub, places]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label="Globe : routes aériennes depuis Madagascar vers l'Europe, l'Afrique australe, le Golfe, l'Inde et l'Asie" />;
}
