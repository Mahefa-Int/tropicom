"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CtaIcon from "./CtaIcon";

// liens : seules l'accueil et « L'Agence » ont une page pour l'instant
const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "L'Agence", href: "/agence" },
  { label: "Expertises", href: "#" },
  { label: "Réalisations", href: "#" },
  { label: "Ressources", href: "#" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [active, setActive] = useState(() => Math.max(0, LINKS.findIndex((l) => l.href === pathname)));

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

  const classes = ["navbar", scrolled && "scrolled", open && "open"].filter(Boolean).join(" ");

  return (
    <header className={classes} id="navbar">
      {/* Logo */}
      <a href="/" className="logo" aria-label="Tropi'Com - Accueil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-tropicom.svg" alt="Tropi'Com" width={110} height={60} />
      </a>

      <nav className="nav" id="nav">
        <ul>
          {LINKS.map(({ label, href }, i) => (
            <li key={label}>
              <a
                href={href}
                className={i === active ? "active" : undefined}
                onClick={(e) => {
                  if (href === "#") e.preventDefault();
                  setActive(i);
                  setOpen(false);
                }}
              >
                {label}
              </a>
            </li>
          ))}
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
