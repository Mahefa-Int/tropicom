"use client";

import { useState } from "react";

/**
 * Page d'essai : 4 propositions de sous-menu pour « L'Agence » (L'équipe, Notre histoire, Carrières).
 * Chaque démo est une barre de menu factice dans un cadre ; on survole (ou on clique) « L'Agence ».
 * 1. méga-panneau avec aperçus ; 2. pilule qui s'étire ; 3. panneau éditorial avec image ; 4. rideau plein écran.
 */
const PAGES = [
  { n: "01", label: "L'équipe", href: "/agence/equipe", text: "Qui sommes-nous, notre histoire, nos valeurs.", img: "/images/agence/equipe.webp" },
  { n: "02", label: "Notre histoire", href: "/agence/notre-histoire", text: "Des spécialistes, pas des polyvalents.", img: "/images/equipe/josceline.webp" },
  { n: "03", label: "Carrières", href: "/agence/carrieres", text: "Faire rayonner l'océan Indien, depuis l'océan Indien.", img: "/images/carriere/tournage.webp" },
];
const OTHERS = ["Expertises", "Réalisations", "Ressources", "Contact"];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function Bar({ children, variant }: { children: React.ReactNode; variant: string }) {
  return (
    <div className={"md-bar md-bar--" + variant}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="md-logo" src="/images/logo-tropicom.svg" alt="" width={110} height={60} />
      <ul className="md-links">
        <li>
          <span className="md-link">Accueil</span>
        </li>
        {children}
        {OTHERS.map((o) => (
          <li key={o} className="md-other">
            <span className="md-link">{o}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 1 — méga-panneau avec aperçus */
function Mega() {
  return (
    <div className="md-frame">
      <Bar variant="mega">
        <li className="md-has md-mega">
          <button type="button" className="md-link md-parent">
            L&apos;Agence <i className="md-caret" />
          </button>
          <div className="md-mega-panel">
            {PAGES.map((p, i) => (
              <a key={p.href} href={p.href} className="md-mega-card" style={{ "--k": i } as React.CSSProperties}>
                <span className="md-mega-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt="" />
                </span>
                <span className="md-mega-txt">
                  <b>{p.label}</b>
                  <small>{p.text}</small>
                </span>
                <span className="md-mega-go">
                  <Arrow />
                </span>
              </a>
            ))}
          </div>
        </li>
      </Bar>
    </div>
  );
}

/* 2 — pilule qui s'étire dans la barre */
function Pill() {
  const [hover, setHover] = useState(0);
  return (
    <div className="md-frame">
      <Bar variant="pill">
        <li className="md-pill" style={{ "--h": hover } as React.CSSProperties}>
          <span className="md-link md-pill-head">L&apos;Agence</span>
          <span className="md-pill-body">
            <span className="md-pill-ind" aria-hidden="true"></span>
            {PAGES.map((p, i) => (
              <a key={p.href} href={p.href} onMouseEnter={() => setHover(i)}>
                {p.label}
              </a>
            ))}
          </span>
        </li>
      </Bar>
    </div>
  );
}

/* 3 — panneau éditorial : liens numérotés à gauche, image qui change à droite */
function Editorial() {
  const [cur, setCur] = useState(0);
  return (
    <div className="md-frame">
      <Bar variant="edit">
        <li className="md-has md-edit">
          <button type="button" className="md-link md-parent">
            L&apos;Agence <i className="md-caret" />
          </button>
          <div className="md-edit-panel">
            <ol>
              {PAGES.map((p, i) => (
                <li key={p.href}>
                  <a href={p.href} className={i === cur ? "is-cur" : undefined} onMouseEnter={() => setCur(i)} onFocus={() => setCur(i)}>
                    <span className="md-edit-n">{p.n}</span>
                    <span className="md-edit-l">{p.label}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ol>
            <div className="md-edit-media">
              {PAGES.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.href} src={p.img} alt="" className={i === cur ? "is-cur" : undefined} />
              ))}
              <p>{PAGES[cur].text}</p>
            </div>
          </div>
        </li>
      </Bar>
    </div>
  );
}

/* 4 — rideau plein écran (ici limité au cadre de démo) */
function Curtain() {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(-1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      className={"md-frame md-frame--curtain" + (open ? " is-open" : "")}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <Bar variant="curtain">
        <li>
          <button type="button" className="md-link md-parent md-curtain-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            L&apos;Agence <span className="md-plus" aria-hidden="true"></span>
          </button>
        </li>
      </Bar>
      <div className="md-curtain" aria-hidden={!open}>
        <span className="md-curtain-glow md-curtain-glow--a"></span>
        <span className="md-curtain-glow md-curtain-glow--b"></span>
        <ol>
          {PAGES.map((p, i) => (
            <li key={p.href} style={{ "--k": i } as React.CSSProperties}>
              <a href={p.href} onMouseEnter={() => setCur(i)} onMouseLeave={() => setCur(-1)} tabIndex={open ? 0 : -1}>
                <span className="md-curtain-n">{p.n}</span>
                <span className="md-curtain-l" data-text={p.label}>
                  {p.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <span
          className={"md-curtain-thumb" + (cur >= 0 ? " is-on" : "")}
          style={{ left: pos.x, top: pos.y, backgroundImage: cur >= 0 ? `url(${PAGES[cur].img})` : undefined }}
          aria-hidden="true"
        ></span>
      </div>
    </div>
  );
}

export default function MenuDemos() {
  return (
    <>
      <section>
        <h2>
          Menu 1. Méga-panneau avec aperçus <small>survolez « L&apos;Agence »</small>
        </h2>
        <Mega />
      </section>
      <section>
        <h2>
          Menu 2. Pilule qui s&apos;étire <small>survolez « L&apos;Agence » : les sous-pages s&apos;ouvrent dans la barre</small>
        </h2>
        <Pill />
      </section>
      <section>
        <h2>
          Menu 3. Panneau éditorial <small>survolez « L&apos;Agence », puis chaque lien : l&apos;image change</small>
        </h2>
        <Editorial />
      </section>
      <section>
        <h2>
          Menu 4. Rideau plein écran <small>cliquez sur « L&apos;Agence » (dans le vrai site, il couvre tout l&apos;écran)</small>
        </h2>
        <Curtain />
      </section>
    </>
  );
}
