"use client";

import { useEffect, useRef, useState } from "react";
import CtaIcon from "./CtaIcon";
import Fireflies from "./Fireflies";

// Lucioles du footer : 25, surtout au-dessus de l'herbe (moitié basse)
const fireLeft = (_i: number, r: (a: number, b: number) => number) => r(2, 98);
const fireTop = (i: number, r: (a: number, b: number) => number) => (i % 4 === 3 ? r(30, 60) : r(60, 98));

export default function Footer() {
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  // Newsletter : la pilule s'élargit avec l'e-mail saisi (largeur mesurée sur une copie invisible du texte)
  const fitNews = () => {
    const input = inputRef.current;
    const sizer = sizerRef.current;
    if (!input || !sizer) return;
    sizer.textContent = input.value || input.placeholder;
    input.style.width = sizer.offsetWidth + "px";
  };

  useEffect(() => {
    fitNews();
    window.addEventListener("resize", fitNews);
    document.fonts?.ready.then(fitNews);
    return () => window.removeEventListener("resize", fitNews);
  }, []);

  return (
    <footer className="footer" id="contact" data-reveal>
      {/* Image : /images/footer-logo-tropicom.png (3261 x 734) */}
      <div className="footer-logo" role="img" aria-label="Tropi'Com"></div>
      {/* Image : /images/colline-tv.png, retournée en miroir */}
      <div className="footer-hill" aria-hidden="true">
        <span className="tv-screen"></span>
      </div>
      <Fireflies className="footer-fireflies" left={fireLeft} top={fireTop} />

      <nav className="footer-col footer-nav" aria-label="Navigation du pied de page">
        <h2 className="footer-title">Navigation</h2>
        <ul>
          <li><a href="#">Accueil</a></li>
          <li><a href="#">L’Agence</a></li>
          <li><a href="#">Réalisation</a></li>
          <li><a href="#">Expertises</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>

      <div className="footer-col footer-contact">
        <h2 className="footer-title">Restons en contact</h2>
        <ul>
          <li><a href="mailto:admin@tropicomagency.com" className="footer-mail">admin@tropicomagency.com</a></li>
          <li><a href="tel:+40746907300">+40 746 907 300</a></li>
          <li><a href="tel:+261386049449">+261 38 60 494 49</a></li>
        </ul>
      </div>

      <div className="footer-col footer-social">
        <h2 className="footer-title footer-title-lg">Suivez-nous</h2>
        <ul>
          <li>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" /></svg>
            </a>
          </li>
          <li>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="stroke"><rect x="1.1" y="1.1" width="21.8" height="21.8" rx="6.2" /><circle cx="12" cy="12" r="4.9" /><circle cx="18.2" cy="5.8" r=".7" className="dot" /></svg>
            </a>
          </li>
          <li>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path fillRule="evenodd" d="M2 0h20a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm1.6 9v11.4h3.6V9H3.6zm1.8-5.6a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zM9.4 9v11.4H13v-5.6c0-1.5.3-3 2.1-3 1.8 0 1.9 1.7 1.9 3.1v5.5h3.5v-6.3c0-3.1-.7-5.4-4.3-5.4-1.7 0-2.9.9-3.4 1.8V9H9.4z" /></svg>
            </a>
          </li>
          <li>
            <a href="#" aria-label="TikTok">
              <svg viewBox="3.9 3 17 18" preserveAspectRatio="none" className="tt"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1-2.6-2.6c0-1.7 1.7-3 3.4-2.5V9.7c-3.5-.5-6.5 2.2-6.5 5.6 0 3.3 2.8 5.7 5.7 5.7 3.1 0 5.7-2.6 5.7-5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3s-1.9.1-3.2-1.5z" /></svg>
            </a>
          </li>
        </ul>
      </div>

      <ul className="footer-info">
        <li>
          <svg viewBox="0 0 24 24" className="info-pin"><path fillRule="evenodd" d="M12 2a7.5 7.5 0 0 0-7.5 7.5C4.5 15 12 22 12 22s7.5-7 7.5-12.5A7.5 7.5 0 0 0 12 2zm0 10.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8z" /></svg>
          <span>Andrefan’Amboijanahary,<br />Antananarivo 101 Madagascar</span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" className="info-cal"><path d="M6.5 2.5h2.2v2h6.6v-2h2.2v2h1.6a1.9 1.9 0 0 1 1.9 1.9v2.7H3V6.4a1.9 1.9 0 0 1 1.9-1.9h1.6v-2zM3 10.6h18v9.5a1.9 1.9 0 0 1-1.9 1.9H4.9A1.9 1.9 0 0 1 3 20.1v-9.5z" /></svg>
          <span>Lundi – Vendredi de 9 à 17 heures</span>
        </li>
      </ul>

      {/* Newsletter */}
      <form
        className={`footer-news${sent ? " sent" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <label className="sr-only" htmlFor="news-mail">Votre adresse e-mail</label>
        <input type="email" id="news-mail" placeholder="Rakoto@gmail" required ref={inputRef} onInput={fitNews} />
        <span className="news-sizer" aria-hidden="true" ref={sizerRef}></span>
        <button type="submit" className="cta news-btn">
          <CtaIcon />
          <span className="cta-label">S’abonner</span>
        </button>
      </form>

      <p className="footer-copy">Copyright©2027 Tropi’com Agency. Tous droits réservés.</p>
      <ul className="footer-legal">
        <li><a href="#">Conditions d’utilisation</a></li>
        <li><a href="#">Politique de confidentialité</a></li>
      </ul>
    </footer>
  );
}
