"use client"

/**
 * Case Stack Scroll (d'après le composant 21st.dev de kedhareswer, licence MIT),
 * adapté à la charte Tropi'Com : fond noir, DM Sans, jaune doré / rose magenta / bleu canard.
 *
 * Les études de cas sont empilées comme des dossiers dans un tiroir : la carte la plus
 * proche est face à vous, les autres ne montrent que leur bande du haut. Molette, glisser,
 * balayage ou flèches du clavier font tourner la pile ; survoler une carte la soulève.
 *
 * Avec peu de cartes (3), la pile est remplie en répétant les cartes (au moins 6 plans),
 * mais le compteur et les libellés affichent bien 3 études de cas.
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
  /** Carte de devant en premier ; les autres se rangent derrière. */
  cards?: CaseCard[]
  /** Deux lignes courtes en bas à gauche. */
  tagline?: [string, string]
  ctaLabel?: string
  ctaHref?: string
  /** Libellé après le nombre de cartes, à droite. */
  countLabel?: string
  cursorLabel?: string
  /** Texte du bouton de chaque carte (vide = pas de bouton). */
  cardButton?: string
  /** Affiche les libellés à gauche (n° + nom) et à droite (nombre d'études de cas). */
  showLabels?: boolean
  onSelect?: (card: CaseCard, index: number) => void
  /** Hauteur : une longueur définie (les % ne marchent pas sans parent de hauteur fixe). */
  height?: string
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

/** Nombre minimum de plans dans la pile (les cartes sont répétées si besoin). */
const MIN_PLANES = 6

// #region stack-layout
/** Distance qu'une carte parcourt devant avant de repasser au fond de la pile. */
const FALL = 1.6

/** Position de la carte k derrière celle de devant, en boucle dans les deux sens. */
export const slotOf = (k: number, roll: number, n: number) => ((((k - roll + FALL) % n) + n) % n) - FALL

/**
 * Pose de la carte k (sur n) pour un défilement `roll`, la carte `hover` étant soulevée de
 * `lift` (0..1). y et z sont en hauteurs de carte, rot en degrés.
 */
export function cardPose(k: number, roll: number, hover: number, lift: number, n: number) {
  const s = slotOf(k, roll, n)
  let y: number
  let z: number
  let rot: number
  if (s >= 0) {
    // rangées en montant vers le fond : bandes régulières, de plus en plus petites
    y = -s * 0.15 - s * s * 0.003
    z = -s * 0.15
    rot = Math.min(s, 1) * 13
  } else {
    // passée devant, la carte sort par le bas, de face
    y = -s * 0.75
    z = -s * 0.04
    rot = 0
  }
  if (hover >= 0 && lift > 0) {
    // la carte soulevée se tourne vers vous ; celles de devant descendent pour la dégager
    if (k === hover) {
      rot *= 1 - lift
      y -= lift * 0.1
      z += lift * 0.08
    } else if (s < slotOf(hover, roll, n)) y += lift * 0.62
    else y -= lift * 0.05
  }
  // les deux extrémités s'effacent avant de boucler : aucune carte ne saute à l'écran
  const back = Math.min(13, n - FALL)
  // une carte passée devant s'efface en descendant (sinon elle resterait visible sous la carte de devant)
  const opacity = s < 0 ? Math.max(0, 1 + s * 1.4) : s > back - 1.5 ? Math.max(0, (back - s) / 1.5) : 1
  return { y, z, rot, opacity, slot: s }
}
// #endregion

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

export default function CaseStackScroll({
  cards = CARDS,
  tagline = ["Trois établissements.", "Trois résultats mesurés."],
  ctaLabel = "Voir toutes les études de cas",
  ctaHref = "#",
  countLabel = "études de cas",
  cursorLabel = "Voir l’étude cas",
  cardButton = "",
  showLabels = true,
  onSelect,
  height = "100svh",
  className = "",
}: CaseStackScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const cursorRef = useRef<HTMLDivElement>(null)
  const state = useRef({ roll: 0, target: 0, hover: -1, lifts: [] as number[], ch: 300, cw: 480, front: 0 })
  const [front, setFront] = useState(0)
  const [hover, setHover] = useState(-1)

  // peu de cartes : on les répète pour que la pile ait de la profondeur
  const unique = cards.length
  const copies = Math.max(1, Math.ceil(MIN_PLANES / Math.max(unique, 1)))
  const planes = Array.from({ length: copies }, () => cards).flat()
  const n = planes.length

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const st = state.current
    st.lifts = planes.map((_, i) => st.lifts[i] ?? 0)

    const size = () => {
      const w = root.clientWidth
      const h = root.clientHeight
      const narrow = w < 720
      // la largeur de la carte suit la scène, sans devenir trop haute pour la pile
      // la carte de devant doit rester entière (nom + bouton visibles) avec la pile au-dessus :
      // hauteur de carte ≤ (hauteur - marges) / 1.32
      st.cw = Math.min(narrow ? w * 0.94 : w * 0.88, (((h - 40) / 1.32) * FACE_W) / FACE_H)
      st.ch = (st.cw * FACE_H) / FACE_W
      root.style.setProperty("--cs-cw", st.cw + "px")
      root.style.setProperty("--cs-ch", st.ch + "px")
      root.style.setProperty("--cs-k", String(st.cw / FACE_W))
    }

    const place = () => {
      for (let k = 0; k < n; k++) {
        const el = cardRefs.current[k]
        if (!el) continue
        const p = cardPose(k, st.roll, st.hover, st.hover >= 0 ? st.lifts[st.hover] : 0, n)
        el.style.transform =
          "translate3d(-50%," + (p.y * st.ch).toFixed(2) + "px," + (p.z * st.ch).toFixed(2) + "px) rotateX(" + (-p.rot).toFixed(2) + "deg)"
        el.style.opacity = p.opacity.toFixed(3)
        el.style.zIndex = String(Math.round(1000 - p.slot * 10))
        el.style.visibility = p.opacity <= 0 ? "hidden" : "visible"
        // les cartes au fond du tiroir sont un peu dans l'ombre
        el.style.setProperty("--cs-shade", Math.min(0.35, Math.max(0, (p.slot - 1) * 0.08)).toFixed(3))
      }
    }

    const tick = () => {
      const ease = reduced() ? 1 : 0.085
      st.roll += (st.target - st.roll) * ease
      if (Math.abs(st.target - st.roll) < 0.0005) st.roll = st.target
      for (let k = 0; k < n; k++) {
        const goal = k === st.hover ? 1 : 0
        st.lifts[k] += (goal - st.lifts[k]) * (reduced() ? 1 : 0.12)
      }
      const f = ((Math.round(st.roll) % n) + n) % n
      if (f !== st.front) {
        st.front = f
        setFront(f)
      }
      place()
    }

    size()
    place()
    const ro = new ResizeObserver(() => {
      size()
      place()
    })
    ro.observe(root)
    gsap.ticker.add(tick)
    return () => {
      ro.disconnect()
      gsap.ticker.remove(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // molette, glisser et balayage font tourner la pile, en boucle dans les deux sens
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const st = state.current
    let snap = 0
    // Défilement borné (pas de boucle infinie) : de la 1re à la dernière carte.
    // Arrivé à un bout, la molette rend la main à la page (on peut continuer à descendre ou remonter).
    const max = Math.max(unique - 1, 0)
    const clamp = (v: number) => Math.min(max, Math.max(0, v))
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      const px = e.deltaMode === 1 ? d * 32 : d
      if (px === 0) return
      // déjà sur la dernière carte en descendant, ou sur la 1re en remontant → la page défile
      if ((px > 0 && st.target >= max - 0.01) || (px < 0 && st.target <= 0.01)) return
      // la section n'est pas encore bien en face de l'écran → on laisse la page s'y placer d'abord
      // repère : juste sous le menu fixe du site
      const navH = document.getElementById("navbar")?.offsetHeight ?? 0
      const r = root.getBoundingClientRect()
      const off = r.top - navH
      if (Math.abs(off) > Math.max(120, innerHeight * 0.15)) return
      e.preventDefault()
      if (Math.abs(off) > 1) window.scrollBy({ top: off, behavior: "smooth" })
      st.target = clamp(st.target + px / 420)
      // quand la molette s'arrête, on se cale sur une carte entière
      clearTimeout(snap)
      snap = window.setTimeout(() => (st.target = Math.round(st.target)), 160)
    }
    // glisser : à la souris de haut en bas ; au doigt de gauche à droite (le défilement vertical reste à la page)
    let drag: { id: number; x: number; y: number; t: number; touch: boolean; moved: boolean } | null = null
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: st.target, touch: e.pointerType !== "mouse", moved: false }
    }
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return
      const d = drag.touch ? drag.x - e.clientX : drag.y - e.clientY
      if (!drag.moved && Math.abs(d) > 6) {
        drag.moved = true
        root.setPointerCapture(e.pointerId)
      }
      if (drag.moved) st.target = clamp(drag.t + d / ((drag.touch ? st.cw : st.ch) * 0.42))
    }
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return
      if (drag.moved) {
        st.target = Math.round(st.target)
        // un glisser n'est pas un clic sur la carte sous le doigt
        root.addEventListener("click", (c) => c.stopPropagation(), { capture: true, once: true })
      }
      drag = null
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    root.addEventListener("pointerdown", onDown)
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerup", onUp)
    root.addEventListener("pointercancel", onUp)
    return () => {
      root.removeEventListener("wheel", onWheel)
      root.removeEventListener("pointerdown", onDown)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerup", onUp)
      root.removeEventListener("pointercancel", onUp)
      clearTimeout(snap)
    }
  }, [n, unique])

  // la bulle « Voir le projet » suit la souris pendant qu'une carte est soulevée
  useEffect(() => {
    const root = rootRef.current
    const cur = cursorRef.current
    if (!root || !cur) return
    const x = gsap.quickTo(cur, "x", { duration: reduced() ? 0 : 0.35, ease: "power3.out" })
    const y = gsap.quickTo(cur, "y", { duration: reduced() ? 0 : 0.35, ease: "power3.out" })
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const r = root.getBoundingClientRect()
      x(e.clientX - r.left)
      y(e.clientY - r.top)
    }
    root.addEventListener("pointermove", onMove)
    return () => root.removeEventListener("pointermove", onMove)
  }, [])

  const setLift = (k: number) => {
    state.current.hover = k
    setHover(k)
  }

  const go = (d: number) => {
    const st = state.current
    st.target = Math.min(Math.max(unique - 1, 0), Math.max(0, Math.round(st.target) + d))
  }

  const shown = (hover >= 0 ? hover : front) % Math.max(unique, 1)
  const card = cards[shown]

  return (
    <div
      ref={rootRef}
      className={"cs-root" + (hover >= 0 ? " cs-lifting" : "") + (className ? " " + className : "")}
      style={{ "--cs-h": height } as CSSProperties}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "PageDown") (e.preventDefault(), go(1))
        else if (e.key === "ArrowUp" || e.key === "PageUp") (e.preventDefault(), go(-1))
      }}
    >
      <style>{CSS}</style>

      <div className="cs-stage">
        {planes.map((c, k) => (
          <button
            key={k}
            ref={(el) => {
              cardRefs.current[k] = el
            }}
            type="button"
            className={"cs-card" + (k === hover ? " cs-on" : "")}
            aria-label={c.title + ", " + c.category}
            aria-hidden={k >= unique ? true : undefined}
            tabIndex={k === front ? 0 : -1}
            onPointerEnter={(e) => e.pointerType === "mouse" && setLift(k)}
            onPointerLeave={(e) => e.pointerType === "mouse" && state.current.hover === k && setLift(-1)}
            onFocus={() => setLift(k)}
            onBlur={() => setLift(-1)}
            onClick={() => {
              // tactile : le 1er toucher soulève, le 2e ouvre
              if (hover !== k) return setLift(k)
              onSelect?.(c, k % unique)
              if (c.href) window.location.href = c.href
            }}
          >
            <span className="cs-card-in">
              <Face card={c} button={cardButton} />
            </span>
          </button>
        ))}
      </div>

      {showLabels && (
        <>
          <div className="cs-label cs-left" aria-live="polite">
            <span className="cs-mono">{hover >= 0 ? card?.category : String(shown + 1).padStart(2, "0") + " / " + String(unique).padStart(2, "0")}</span>
            <span className="cs-big">{card?.title}</span>
          </div>
          <div className="cs-label cs-right">
            <span className="cs-big">
              <em>{String(unique).padStart(2, "0")}</em> {countLabel}
            </span>
          </div>
        </>
      )}
      {(tagline[0] || tagline[1]) && (
        <div className="cs-mono cs-tag">
          {tagline[0]}
          <br />
          {tagline[1]}
        </div>
      )}
      {ctaLabel && (
        <a className="cs-mono cs-cta" href={ctaHref}>
          <span aria-hidden="true">↳</span> {ctaLabel}
        </a>
      )}

      <div ref={cursorRef} className="cs-cursor" aria-hidden="true">
        <span>
          {cursorLabel}
          <svg viewBox="0 0 12 12" width="12" height="12">
            <path d="M2 1l9 5-4 1-2 4z" fill="currentColor" />
          </svg>
        </span>
      </div>
    </div>
  )
}

/* Styles du composant (charte Tropi'Com : variables de globals.css, police DM Sans du site) */
const CSS = `
.cs-root{position:relative;height:var(--cs-h);min-height:420px;width:100%;overflow:hidden;background:var(--noir,#000);color:var(--white,#fff);font-family:var(--font-dm-sans),system-ui,sans-serif;container:cs/inline-size;user-select:none;-webkit-user-select:none}
.cs-root img{max-width:none}
.cs-stage{position:absolute;inset:0;perspective:1100px;perspective-origin:50% 0%;touch-action:pan-y}
.cs-card{position:absolute;left:50%;top:calc(100% - var(--cs-ch) / 2 - 32px);width:var(--cs-cw);height:var(--cs-ch);margin-top:calc(var(--cs-ch) / -2);padding:0;border:0;border-radius:calc(40 * var(--cs-k,.4) * 1px);overflow:hidden;background:#171616;cursor:pointer;transform-origin:50% 50%;backface-visibility:hidden;will-change:transform;outline:none;box-shadow:0 -1px 0 rgb(255 255 255 / .12),0 24px 50px -24px rgb(0 0 0 / .9)}
.cs-card::after{content:"";position:absolute;inset:0;background:#000;opacity:var(--cs-shade,0);pointer-events:none;transition:opacity .2s}
.cs-card:focus-visible{outline:2px solid var(--rose-magenta,#de0b7d);outline-offset:4px}
.cs-card-in{position:absolute;inset:0;overflow:hidden;display:block}
.cs-card-in img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.cs-root.cs-lifting .cs-card.cs-on{cursor:none}
.cs-label{position:absolute;top:clamp(24px,3.4cqw,48px);display:flex;flex-direction:column;gap:.45rem;pointer-events:none;z-index:20}
.cs-left{left:clamp(16px,4.45cqw,64px)}
.cs-right{right:clamp(16px,4.45cqw,64px);text-align:right}
.cs-big{font-size:clamp(16px,1.67cqw,24px);font-weight:500;letter-spacing:-.02em;line-height:1.1}
.cs-big em{font-style:normal;color:var(--jaune-dore,#f7c227)}
.cs-mono{font-size:clamp(10px,.8cqw,12px);font-weight:500;letter-spacing:.08em;text-transform:uppercase;line-height:1.5;color:rgb(255 255 255 / .6)}
.cs-left .cs-mono{color:var(--jaune-dore,#f7c227)}
.cs-tag{position:absolute;left:clamp(16px,4.45cqw,64px);bottom:clamp(16px,2.6cqw,40px);z-index:20;pointer-events:none}
.cs-cta{position:absolute;right:clamp(16px,4.45cqw,64px);bottom:clamp(14px,2.4cqw,36px);z-index:20;color:var(--white,#fff);text-decoration:none;padding:.75em 1.1em;background:rgb(255 255 255 / .08);border:1px solid rgb(255 255 255 / .18);border-radius:12px;transition:background-color .25s,color .25s,border-color .25s}
.cs-cta:hover{background:var(--jaune-dore,#f7c227);border-color:var(--jaune-dore,#f7c227);color:var(--noir,#000)}
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

@container cs (max-width: 720px){
  .cs-stage{top:64px;bottom:72px;overflow:hidden}
  .cs-card{top:calc(100% - var(--cs-ch) / 2 - 16px)}
  .cs-label{top:clamp(16px,4cqw,28px);transform:none}
  .cs-big{font-size:16px}
}
@media (prefers-reduced-motion: reduce){
  .cs-cursor span,.cs-card::after,.cs-cta{transition:none}
}
`
