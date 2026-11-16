"use client";

import { useState } from "react";

/**
 * « De Madagascar à tout l'Océan Indien » — destinations.
 * Maquette 1440 × 809 : carte de texte à gauche (photo + accroche + paragraphe), 5 pastilles de
 * destination, mini-carte de l'océan Indien à droite ; en fond, la même carte agrandie et floutée.
 * Choisir une destination : la carte de texte change, les routes partent de la ville principale
 * de cette destination et le fond se recentre dessus.
 * À COMPLÉTER : photo et textes propres à Maurice, La Réunion, Seychelles, Comores (provisoires).
 */

// ---------- carte (repère de la mini-carte : 365 × 400, origine en haut à gauche du cadre) ----------
type City = { id: string; name: string; x: number; y: number; dx?: number; dy?: number; anchor?: "start" | "end" };

const CITIES: City[] = [
  { id: "zanzibar", name: "Zanzibar", x: 76.5, y: 82, dx: 8, dy: 2.5 },
  { id: "praslin", name: "Praslin", x: 308, y: 56, dx: 8, dy: -1 },
  { id: "mahe", name: "Mahé", x: 304, y: 62, dx: -8, dy: 3, anchor: "end" },
  { id: "moroni", name: "Moroni", x: 134, y: 160, dx: -7, dy: 2.5, anchor: "end" },
  { id: "diego", name: "Diego Suarez", x: 217.5, y: 168, dx: 9, dy: 2.5 },
  { id: "nosybe", name: "", x: 203.5, y: 183 },
  { id: "saintemarie", name: "Sainte-Marie", x: 226, y: 234, dx: 8, dy: 2.5 },
  { id: "tana", name: "Antananarivo", x: 192.5, y: 260, dx: -10, dy: 2.5, anchor: "end" },
  { id: "portlouis", name: "Port-Louis", x: 333, y: 279, dx: -8, dy: -7, anchor: "end" },
  { id: "saintdenis", name: "Saint-Denis", x: 304, y: 289, dx: -9, dy: 12, anchor: "end" },
];

// Madagascar (silhouette simplifiée, relevée sur /images/destinations/carte-ocean-indien.webp)
const MADA = "M147 219 L177 215 L199 196.5 L217 166 L233.5 219 L200 300 L187.5 345 L161 353.5 L134 311 L144 232 Z";
// côte africaine (pointillés)
const COAST = [
  "M101 22 C 93 40 82 60 76 82 C 72 100 74 122 80 142 C 86 164 93 186 93 206 C 92 222 82 230 68 238 C 52 247 40 256 31 270 C 22 285 22 310 22 340",
];

type Dest = {
  id: string;
  label: string;
  hub: string; // ville d'où partent les routes
  image: string;
  title: { text: string; muted?: boolean }[];
  text: string;
};

const BASE_TEXT = "Nous travaillons là où le voyage se vit, avec des équipes qui parlent la langue de vos clients et celle de vos équipes.";
const head = (first: string) => [
  { text: first + " " },
  { text: "l’Océan Indien.", muted: true },
  { text: " Nous travaillons là où le voyage se vit, avec des équipes qui " },
  { text: "parlent la langue de vos clients", muted: true },
  { text: " et " },
  { text: "celle de vos équipes.", muted: true },
];

const DESTS: Dest[] = [
  { id: "madagascar", label: "Madagascar", hub: "tana", image: "/images/destinations/ile-ocean-indien.jpg", title: head("De Madagascar à tout"), text: BASE_TEXT },
  // PROVISOIRES (photo et textes à fournir)
  { id: "maurice", label: "Maurice", hub: "portlouis", image: "/images/destinations/ile-ocean-indien.jpg", title: head("De Maurice à tout"), text: BASE_TEXT },
  { id: "reunion", label: "La Réunion", hub: "saintdenis", image: "/images/destinations/ile-ocean-indien.jpg", title: head("De La Réunion à tout"), text: BASE_TEXT },
  { id: "seychelles", label: "Seychelles", hub: "mahe", image: "/images/destinations/ile-ocean-indien.jpg", title: head("Des Seychelles à tout"), text: BASE_TEXT },
  { id: "comores", label: "Comores", hub: "moroni", image: "/images/destinations/ile-ocean-indien.jpg", title: head("Des Comores à tout"), text: BASE_TEXT },
];

const city = (id: string) => CITIES.find((c) => c.id === id)!;

/** La carte (même dessin pour la mini-carte et pour le fond flou). */
function MapArt({ hub, big = false }: { hub: string; big?: boolean }) {
  const h = city(hub);
  return (
    <>
      {/* grille discrète */}
      <g className="dst-grid">
        {[60, 130, 200, 270, 340].map((x) => (
          <line key={"x" + x} x1={x} y1={0} x2={x} y2={400} />
        ))}
        {[40, 120, 200, 280, 360].map((y) => (
          <line key={"y" + y} x1={0} y1={y} x2={365} y2={y} />
        ))}
      </g>
      {COAST.map((d, i) => (
        <path key={i} className="dst-coast" d={d} />
      ))}
      <path className="dst-mada" d={MADA} />
      {/* routes depuis la ville principale (key = hub → elles se redessinent au changement) */}
      <g key={hub} className="dst-routes">
        {CITIES.filter((c) => c.id !== hub).map((c, i) => {
          const mx = (h.x + c.x) / 2 + (c.y - h.y) * 0.08;
          const my = (h.y + c.y) / 2 - (c.x - h.x) * 0.08;
          return (
            <path
              key={c.id}
              d={`M${h.x} ${h.y} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${c.x} ${c.y}`}
              style={{ "--d": i * 0.06 + "s" } as React.CSSProperties}
            />
          );
        })}
      </g>
      {/* petites îles (Comores, Nosy Be) */}
      <g className="dst-islets">
        <ellipse cx={127} cy={166} rx={2.2} ry={1.5} />
        <ellipse cx={135} cy={165} rx={2.2} ry={1.5} />
        <ellipse cx={159} cy={176} rx={2.2} ry={1.5} />
      </g>
      <text className="dst-label dst-label--muted" x={165} y={178.5}>
        Nosy Be
      </text>
      {CITIES.map((c) => (
        <g key={c.id} className={"dst-city" + (c.id === hub ? " is-hub" : "")}>
          <circle className="halo" cx={c.x} cy={c.y} r={c.id === hub ? 7 : 5} />
          <circle className="dot" cx={c.x} cy={c.y} r={c.id === hub ? 3.4 : 2.4} />
          {c.name && (
            <text className="dst-label" x={c.x + (c.dx ?? 8)} y={c.y + (c.dy ?? 2.5)} textAnchor={c.anchor ?? "start"}>
              {c.name}
            </text>
          )}
        </g>
      ))}
      {!big && (
        <>
          <text className="dst-coord" x={22} y={30}>
            5°S
          </text>
          <text className="dst-coord" x={22} y={241}>
            20°S
          </text>
          <text className="dst-coord" x={158} y={382}>
            45°E
          </text>
          <text className="dst-coord" x={299} y={382}>
            55°E
          </text>
        </>
      )}
    </>
  );
}

export default function Destinations() {
  const [active, setActive] = useState(0);
  const d = DESTS[active];
  const hub = city(d.hub);
  // fond : la carte ×5,4, la ville principale placée en (603, 604) de la maquette
  const bgX = 603 - hub.x * 5.4;
  const bgY = 604 - hub.y * 5.4;

  return (
    <section className="dst" id="destinations" data-reveal aria-labelledby="dst-title">
      {/* fond : la carte (image nette fournie) agrandie et floutée */}
      <div className="dst-bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/destinations/carte-ocean-indien.webp"
          alt=""
          style={{ transform: `translate(calc(${bgX.toFixed(1)} * var(--o)), calc(${bgY.toFixed(1)} * var(--o)))` }}
        />
      </div>

      {/* carte de texte */}
      <article className="dst-card" key={d.id}>
        <span className="dst-dot" aria-hidden="true"></span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dst-photo" src={d.image} alt={"Paysage — " + d.label} />
        <h2 className="dst-title" id="dst-title">
          {d.title.map((p, i) => (
            <span key={i} className={p.muted ? "is-muted" : undefined}>
              {p.text}
            </span>
          ))}
        </h2>
        <p className="dst-text">{d.text}</p>
      </article>

      {/* pastilles de destination */}
      <div className="dst-pills" role="tablist" aria-label="Destinations">
        {DESTS.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={"dst-pill" + (i === active ? " is-active" : "")}
            onClick={() => setActive(i)}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* mini-carte */}
      <div className="dst-map">
        {/* repère de l'image de la carte : intérieur du cadre = (9,75 ; 10) → (354,85 ; 390) */}
        <svg viewBox="9.75 10 345.1 380" preserveAspectRatio="none" role="img" aria-label={"Carte de l’océan Indien, liaisons depuis " + hub.name}>
          <MapArt hub={d.hub} />
        </svg>
        <span className="dst-chip">
          <i aria-hidden="true"></i>
          {hub.name}
        </span>
      </div>
    </section>
  );
}
