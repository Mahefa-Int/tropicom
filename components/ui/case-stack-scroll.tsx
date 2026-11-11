"use client"

/**
 * Études de cas : défilement « paquet de cartes » (d'après le composant « scroll-stacking-cards »
 * / Project Deck d'Aakash Mehra), avec les cartes Tropi'Com (même dessin qu'avant).
 *
 * Un écran de défilement par carte ; la scène reste épinglée sous le menu. En défilant, la carte
 * suivante monte du bas, penchée vers vous en 3D et floue, puis se pose à plat et nette au milieu ;
 * celles du dessous se penchent un peu en arrière, reculent et s'assombrissent.
 * Défilement lié au scroll, lissé par un ressort (une seule valeur pilote toutes les cartes) ;
 * paquet immobile et net si l'utilisateur a demandé moins d'animations.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import gsap from "gsap"

/** Halo de couleur posé sur la carte (en px de la maquette, repère de la carte 1312 × 666). */
export type CaseGlow = { x: number; y: number; w: number; h: number; rot: number; blur: number; color: string }

export type CaseCard = {
  title: string
  category: string
  /** Photo affichée en haut de la carte (bande 1280 × 400). */
  image: string
  /** Halos de couleur de la carte (bleu canard, doré, magenta…). */
  glows?: CaseGlow[]
  href?: string
}

export type CaseStackScrollProps = {
  /** Cartes dans l'ordre où elles arrivent (la 1re est déjà posée). */
  cards?: CaseCard[]
  cursorLabel?: string
  /** Texte du bouton de chaque carte (vide = pas de bouton). */
  cardButton?: string
  onSelect?: (card: CaseCard, index: number) => void
  /** Hauteur du menu fixe (px) : la scène s'épingle juste dessous. */
  top?: number
  className?: string
}

/** Les 3 études de cas de la maquette. */
const CARDS: CaseCard[] = [
  {
    title: "GRAND HOTEL DIEGO",
    category: "Nos réalisations",
    image: "/images/cas/grand-hotel-diego.jpg",
    glows: [
      { x: 130, y: 598, w: 840, h: 103, rot: -21.4, blur: 92, color: "rgba(53, 132, 125, 0.73)" },
    ],
  },
  {
    title: "ECHOES OF THE FOREST",
    category: "Nos réalisations",
    image: "/images/cas/echoes-of-the-forest.jpg",
    glows: [
      { x: 1063, y: 271, w: 425, h: 306, rot: -29.7, blur: 139, color: "rgba(223, 176, 28, 0.97)" },
      { x: 369, y: 599, w: 259, h: 114, rot: -22.3, blur: 44, color: "rgba(0, 0, 0, 0.66)" },
    ],
  },
  {
    title: "CALUMMA TRAVEL MADAGASCAR",
    category: "Nos réalisations",
    image: "/images/cas/calumma-travel-madagascar.jpg",
    glows: [
      { x: 14, y: 660, w: 723, h: 119, rot: -26.3, blur: 68, color: "rgba(169, 0, 97, 0.72)" },
      { x: 608, y: 415, w: 1153, h: 232, rot: -45.5, blur: 146, color: "rgba(0, 0, 0, 0.71)" },
    ],
  },
]

/** Taille de dessin d'une carte (maquette : 1312 × 666) ; elle est ensuite mise à l'échelle. */
const FACE_W = 1312
const FACE_H = 666

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Carte d'étude de cas (maquette 1312 × 666) : photo en haut, nom, « Nos réalisations »,
 * bouton (optionnel) et halos de couleur (sous le texte).
 */
function Face({ card, button }: { card: CaseCard; button: string }) {
  return (
    <div className="cs-face cs-case">
      <div className="cs-case-img" style={{ backgroundImage: "url(" + card.image + ")" }} />
      {card.glows?.map((g, i) => (
        <i
          key={i}
          className="cs-case-glow"
          style={{
            left: g.x,
            top: g.y,
            width: g.w,
            height: g.h,
            transform: "rotate(" + g.rot + "deg)",
            filter: "blur(" + g.blur + "px)",
            background: g.color,
          }}
        />
      ))}
      <b className="cs-case-title">{card.title}</b>
      <span className="cs-case-sub">{card.category}</span>
      {button && (
        <span className="cs-case-btn">
          <span className="cs-case-btn-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          {button}
        </span>
      )}
    </div>
  )
}

// #region deck
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - (1 - t) ** 3
/** Part de l'écran de chaque carte passée à arriver ; le reste, elle est posée. */
const ENTER = 0.72

/** Avancée de la carte j (0 = sous l'écran, 1 = posée) pour une progression v (0 → 1) de la section. */
export function arrived(j: number, v: number, count: number) {
  if (j <= 0) return 1
  const span = Math.max(1, count - 1)
  return easeOut(clamp01((v * span - (j - 1)) / ENTER))
}

/**
 * Pose de la carte i : elle monte du bas penchée vers vous et floue, puis se pose à plat et nette ;
 * les cartes déjà posées dessous se penchent un peu en arrière, reculent, montent un peu (on voit
 * leur bord) et s'assombrissent. y en hauteurs d'écran, rot en degrés, blur en px.
 */
export function deckPose(i: number, v: number, count: number) {
  const a = arrived(i, v, count)
  let above = 0
  for (let j = i + 1; j < count; j++) above += arrived(j, v, count)
  above = Math.min(3, above)
  return {
    y: (1 - a) * 1.08 - above * 0.05,
    rot: -(1 - a) * 30 + above * 5,
    scale: 0.9 + 0.1 * a - above * 0.05,
    blur: (1 - a) ** 2 * 12 + above * 1.1,
    dim: above * 0.15,
    arrived: a,
  }
}
// #endregion

export default function CaseStackScroll({
  cards = CARDS,
  cursorLabel = "Voir l’étude cas",
  cardButton = "",
  onSelect,
  top = 0,
  className = "",
}: CaseStackScrollProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const cursorRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(-1)
  const count = cards.length

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return

    // taille des cartes : toute la largeur utile, sans dépasser ~80 % de la hauteur de la scène
    const size = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      const pad = w < 720 ? 16 : Math.min(56, w * 0.04)
      const cw = Math.min(w - pad * 2, ((h * 0.8) * FACE_W) / FACE_H, 1480)
      root.style.setProperty("--cs-cw", cw + "px")
      root.style.setProperty("--cs-ch", (cw * FACE_H) / FACE_W + "px")
      root.style.setProperty("--cs-k", String(cw / FACE_W))
    }

    // progression du défilement dans la section (0 en haut → 1 en bas), lissée sans rebond
    const target = () => {
      const r = root.getBoundingClientRect()
      const run = r.height - stage.clientHeight
      return run > 0 ? clamp01((top - r.top) / run) : 0
    }
    let v = target()
    let vel = 0

    const place = () => {
      const vh = stage.clientHeight
      const still = reduced()
      for (let i = 0; i < count; i++) {
        const el = cardRefs.current[i]
        if (!el) continue
        const p = deckPose(i, v, count)
        if (still) {
          // mouvement réduit : la carte apparaît simplement à sa place quand vient son tour
          el.style.transform = "translate3d(-50%," + (p.arrived >= 0.5 ? 0 : vh * 1.1).toFixed(1) + "px,0)"
          el.style.filter = "none"
          el.style.setProperty("--cs-shade", "0")
          continue
        }
        el.style.transform =
          "translate3d(-50%," + (p.y * vh).toFixed(2) + "px,0) rotateX(" + p.rot.toFixed(3) + "deg) scale(" + p.scale.toFixed(4) + ")"
        el.style.filter = p.blur > 0.05 ? "blur(" + p.blur.toFixed(2) + "px)" : "none"
        el.style.setProperty("--cs-shade", p.dim.toFixed(3))
        // une carte encore sous l'écran n'est pas cliquable
        el.style.visibility = p.arrived <= 0 ? "hidden" : "visible"
      }
    }

    // ressort amorti (raideur 380, amortissement 48, masse 0,35) : suit la molette de près, sans dépasser
    let raf = 0
    let prev = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - prev) / 1000, 1 / 30)
      prev = now
      const t = target()
      if (reduced()) v = t
      else {
        const steps = 4
        const h = dt / steps
        for (let s = 0; s < steps; s++) {
          const f = (-380 * (v - t) - 48 * vel) / 0.35
          vel += f * h
          v += vel * h
        }
        if (Math.abs(t - v) < 1e-5 && Math.abs(vel) < 1e-4) {
          v = t
          vel = 0
        }
      }
      place()
    }

    size()
    place()
    const ro = new ResizeObserver(() => {
      size()
      place()
    })
    ro.observe(stage)
    // ne calcule que lorsque la section est près de l'écran
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf)
        if (e.isIntersecting) {
          prev = performance.now()
          v = target()
          raf = requestAnimationFrame(tick)
          place()
        }
      },
      { rootMargin: "200px 0px" }
    )
    io.observe(root)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [count, top])

  // la bulle « Voir l'étude cas » suit la souris au survol d'une carte
  useEffect(() => {
    const stage = stageRef.current
    const cur = cursorRef.current
    if (!stage || !cur) return
    const x = gsap.quickTo(cur, "x", { duration: reduced() ? 0 : 0.35, ease: "power3.out" })
    const y = gsap.quickTo(cur, "y", { duration: reduced() ? 0 : 0.35, ease: "power3.out" })
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const r = stage.getBoundingClientRect()
      x(e.clientX - r.left)
      y(e.clientY - r.top)
    }
    stage.addEventListener("pointermove", onMove)
    return () => stage.removeEventListener("pointermove", onMove)
  }, [])

  return (
    <section
      ref={rootRef}
      className={"cs-root" + (hover >= 0 ? " cs-lifting" : "") + (className ? " " + className : "")}
      style={{ "--cs-n": count, "--cs-top": top + "px" } as CSSProperties}
      aria-label="Études de cas"
    >
      <style>{CSS}</style>

      {/* un écran de défilement par carte ; la scène reste épinglée pendant que les cartes s'y posent */}
      <div ref={stageRef} className="cs-stage">
        {cards.map((c, i) => (
          <button
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            type="button"
            className={"cs-card" + (i === hover ? " cs-on" : "")}
            style={{ zIndex: i + 1 }}
            aria-label={c.title + ", " + c.category}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setHover((h) => (h === i ? -1 : h))}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(-1)}
            onClick={() => {
              onSelect?.(c, i)
              if (c.href) window.location.href = c.href
            }}
          >
            <span className="cs-card-in">
              <Face card={c} button={cardButton} />
            </span>
          </button>
        ))}

        <div ref={cursorRef} className="cs-cursor" aria-hidden="true">
          <span>
            {cursorLabel}
            <svg viewBox="0 0 12 12" width="12" height="12">
              <path d="M2 1l9 5-4 1-2 4z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  )
}

/* Styles du composant (charte Tropi'Com : variables de globals.css, police DM Sans du site) */
const CSS = `
.cs-root{--cs-sh:calc(100svh - var(--cs-top,0px));position:relative;width:100%;height:calc(var(--cs-n,3) * var(--cs-sh));background:var(--noir,#000);color:var(--white,#fff);font-family:var(--font-dm-sans),system-ui,sans-serif;user-select:none;-webkit-user-select:none}
.cs-root img{max-width:none}
.cs-stage{position:sticky;top:var(--cs-top,0px);height:var(--cs-sh);overflow:hidden;perspective:1800px}
/* petit écran : cartes très larges → scène plus basse, centrée sous le menu, et moins de défilement */
@media (max-width: 720px){.cs-root{--cs-sh:min(calc(100vw * 1.15), calc(100svh - var(--cs-top,0px)))}.cs-stage{top:calc(var(--cs-top,0px) + (100svh - var(--cs-top,0px) - var(--cs-sh)) / 2)}}
.cs-card{position:absolute;left:50%;top:calc(50% - var(--cs-ch) / 2 + 2svh);width:var(--cs-cw);height:var(--cs-ch);padding:0;border:0;border-radius:calc(40 * var(--cs-k,.4) * 1px);overflow:hidden;background:#171616;cursor:pointer;transform:translate3d(-50%,110svh,0);transform-origin:50% 25%;will-change:transform,filter;outline:none;box-shadow:0 -1px 0 rgb(255 255 255 / .12),0 50px 90px -35px rgb(0 0 0 / .9)}
.cs-card::after{content:"";position:absolute;inset:0;background:#0a0c14;opacity:var(--cs-shade,0);pointer-events:none}
.cs-card:focus-visible{outline:2px solid var(--rose-magenta,#de0b7d);outline-offset:4px}
.cs-card-in{position:absolute;inset:0;overflow:hidden;display:block}
.cs-root.cs-lifting .cs-card.cs-on{cursor:none}
.cs-cursor{position:absolute;left:0;top:0;z-index:30;pointer-events:none;width:0;height:0}
.cs-cursor span{position:absolute;left:-40px;top:-40px;width:80px;height:80px;border-radius:50%;background:var(--rose-magenta,#de0b7d);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-align:center;line-height:1.2;padding:0 14px;transform:scale(0);transition:transform .35s cubic-bezier(.2,.8,.2,1);box-shadow:0 10px 30px -10px rgb(222 11 125 / .7)}
.cs-root.cs-lifting .cs-cursor span{transform:scale(1)}
@media (hover: none){.cs-cursor{display:none}}

/* ----- carte d'étude de cas : dessinée à 1312 × 666 (maquette) puis mise à l'échelle ----- */
.cs-face{position:absolute;left:0;top:0;width:1312px;height:666px;transform:scale(var(--cs-k,.4));transform-origin:0 0;overflow:hidden;text-align:left;font-family:var(--font-dm-sans),system-ui,sans-serif;color:#fff;background:#171616;border-radius:40px}
/* photo 1280 × 400 à (16, 16), radius 24 */
.cs-case-img{position:absolute;left:16px;top:16px;width:1280px;height:400px;border-radius:24px;background-size:cover;background-position:center}
/* nom : DM Sans 500, 68 px, -2 % */
.cs-case-title{position:absolute;left:26.5px;top:455.8px;font-size:68.5px;font-weight:500;line-height:68px;letter-spacing:-.02em;white-space:nowrap}
/* « Nos réalisations » : 15 px */
.cs-case-sub{position:absolute;left:26.5px;top:540.9px;font-size:15.3px;line-height:15px;letter-spacing:-.03em}
/* bouton 164 × 50 à 16 px du coin bas droit (même dessin que les boutons du site) */
.cs-case-btn{position:absolute;right:16px;bottom:16px;height:50px;display:flex;align-items:center;gap:10px;padding:3px 17px 3px 3px;border-radius:14px;background:#fff;color:#000;font-size:13px;font-weight:500;letter-spacing:-.02em}
.cs-case-btn-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:11px;background:#000}
.cs-case-btn-icon svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
/* halos de couleur : au-dessus de la photo, sous le texte et le bouton */
.cs-case-glow{position:absolute;border-radius:50%;pointer-events:none}
`
