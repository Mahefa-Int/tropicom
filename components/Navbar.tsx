"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CtaIcon from "./CtaIcon";
import { EXPERTISES, expertiseHref } from "@/lib/expertises";

// menu : « L'Agence » (trois sous-pages) et « Expertises » (cinq pages) ouvrent un sous-menu
type Sub = { label: string; href: string; text: string; img: string };
type Item = { label: string; href: string; children?: Sub[] };
const LINKS: Item[] = [
  { label: "Accueil", href: "/" },
  {
    label: "L'Agence",
    href: "/agence",
    children: [
      { label: "L'équipe", href: "/agence/equipe", text: "Qui sommes-nous, notre histoire, nos valeurs.", img: "/images/agence/equipe.webp" },
      { label: "Notre histoire", href: "/agence/notre-histoire", text: "Des spécialistes, pas des polyvalents.", img: "/images/equipe/josceline.webp" },
      { label: "Carrières", href: "/agence/carrieres", text: "Faire rayonner l'océan Indien, depuis l'océan Indien.", img: "/images/carriere/tournage.webp" },
    ],
  },
  {
    label: "Expertises",
    href: "/expertises",
    children: EXPERTISES.map((e) => ({ label: e.label, href: expertiseHref(e.slug), text: e.promise, img: e.img })),
  },
  { label: "Réalisations", href: "/realisations" },
  { label: "Ressources", href: "/ressources" },
  { label: "Contact", href: "/contact" },
];

const CLEAR_PAGES = ["/agence/carrieres", "/expertises"];

/** lien actif : la page elle-même, ou le parent d'une sous-page */
const isActive = (href: string, path: string) => (href === "/" ? path === "/" : !href.startsWith("#") && path.startsWith(href));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [sub, setSub] = useState<string | null>(null); // sous-menu ouvert (au clic / au clavier ; au survol en CSS)
  const [cur, setCur] = useState(0); // lien survolé dans le panneau (choisit la photo)

  // Barre compacte au scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile ouvert : on bloque le scroll de la page
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // pages dont le haut de page a un halo lumineux derrière le menu : menu transparent tant qu'on n'a pas défilé
  const clear = CLEAR_PAGES.includes(pathname);
  const classes = ["navbar", scrolled && "scrolled", open && "open", clear && "is-clear"].filter(Boolean).join(" ");

  return (
    <header className={classes} id="navbar">
      {/* Logo */}
      <a href="/" className="logo" aria-label="Tropi'Com - Accueil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-tropicom.svg" alt="Tropi'Com" width={110} height={60} />
      </a>

      <nav className="nav" id="nav">
        <ul>
          {LINKS.map((item) =>
            item.children ? (
              <li
                key={item.label}
                className={"has-sub" + (sub === item.label ? " is-open" : "")}
                onMouseEnter={() => setCur(0)}
                onMouseLeave={() => setSub(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSub(null);
                }}
              >
                <button
                  type="button"
                  className={"nav-parent" + (isActive(item.href, pathname) ? " active" : "")}
                  aria-expanded={sub === item.label}
                  aria-controls={"nav-sub-" + item.href.slice(1)}
                  onClick={() => {
                    setCur(0);
                    setSub((o) => (o === item.label ? null : item.label));
                  }}
                >
                  {item.label}
                  <svg className="nav-caret" viewBox="0 0 10 6" aria-hidden="true">
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                </button>
                {/* panneau éditorial : pages numérotées à gauche, photo de la page survolée à droite */}
                <div className="nav-sub" id={"nav-sub-" + item.href.slice(1)}>
                  <ol className="nav-sub-list">
                    {item.children.map((c, k) => (
                      <li key={c.href}>
                        <a
                          href={c.href}
                          className={(pathname === c.href ? "active" : "") + (k === cur ? " is-cur" : "")}
                          onMouseEnter={() => setCur(k)}
                          onFocus={() => setCur(k)}
                          onClick={() => setOpen(false)}
                        >
                          <span className="nav-sub-n">{String(k + 1).padStart(2, "0")}</span>
                          <span className="nav-sub-l">{c.label}</span>
                          <svg className="nav-sub-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 17 17 7" />
                            <path d="M8 7h9v9" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ol>
                  <div className="nav-sub-media" aria-hidden="true">
                    {item.children.map((c, k) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={c.href} src={c.img} alt="" loading="lazy" className={k === Math.min(cur, item.children!.length - 1) ? "is-cur" : undefined} />
                    ))}
                    <p>{item.children[Math.min(cur, item.children.length - 1)].text}</p>
                  </div>
                </div>
              </li>
            ) : (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={isActive(item.href, pathname) ? "active" : undefined}
                  onClick={(e) => {
                    if (item.href === "#") e.preventDefault();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ),
          )}
        </ul>
        <a href="#" className="cta cta-mobile">
          <CtaIcon />
          <span className="cta-label">Demander un diagnostic</span>
        </a>
      </nav>

      <a href="#" className="cta cta-desktop">
        <CtaIcon />
        <span className="cta-label">Demander un diagnostic</span>
      </a>

      <button
        className="burger"
        id="burger"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
