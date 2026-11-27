"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import GlowField, { type Glow } from "./GlowField";
import Fireflies from "./Fireflies";

/**
 * Page de maintenance (affichée à la place du site tant que MAINTENANCE n'est pas « off », voir lib/preview.ts).
 * Inspirée du pied de page et du haut de l'accueil : halos rose et jaune doré, feuille de monstera, colline à la télé,
 * lucioles, grand « TROPI'COM ». Toujours la hauteur de l'écran.
 * Le cadenas (en haut à droite) demande le code d'accès à l'aperçu du site : code statique, sans base de données.
 */
const GLOWS: Glow[] = [
  { x: 1180, y: 120, rx: 620, ry: 560, c: "247, 194, 39", a: 0.55, dx: 90, dy: 60, sp: 0.4, m: -40 },
  { x: 980, y: 760, rx: 600, ry: 520, c: "222, 11, 125", a: 0.6, dx: 120, dy: 60, sp: 0.35, ph: 2, m: 30 },
  { x: 60, y: 80, rx: 460, ry: 420, c: "62, 157, 158", a: 0.32, dx: 80, dy: 50, sp: 0.3, ph: 4, m: 20 },
];

const fireLeft = (_i: number, r: (a: number, b: number) => number) => r(2, 98);
const fireTop = (i: number, r: (a: number, b: number) => number) => (i % 3 === 0 ? r(20, 55) : r(55, 96));

export default function Maintenance() {
  const ref = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // apparition + feuille qui suit légèrement la souris
  useEffect(() => {
    const el = ref.current!;
    const t = setTimeout(() => el.classList.add("in-view"), 60);
    if (prefersReducedMotion()) return () => clearTimeout(t);
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      clearTimeout(t);
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const open = () => {
    setError("");
    dialogRef.current?.showModal();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: f.get("code") }),
    }).catch(() => null);
    if (res?.ok) {
      // l'adresse visitée (ou l'accueil) s'affiche maintenant normalement
      location.href = location.pathname === "/maintenance" ? "/" : location.href;
      return;
    }
    setBusy(false);
    const json = await res?.json().catch(() => null);
    setError(json?.error ?? "Connexion impossible.");
  };

  return (
    <main className="mt" ref={ref}>
      <GlowField glows={GLOWS} breath={0.8} />
      <div className="mt-leaf" aria-hidden="true" />
      <div className="mt-hill" aria-hidden="true" />
      <Fireflies className="mt-fireflies" count={22} left={fireLeft} top={fireTop} />
      <div className="mt-word" role="img" aria-label="Tropi'Com" />

      <header className="mt-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-tropicom.webp" alt="Tropi'Com" width={110} height={60} className="mt-logo" />
        <button type="button" className="mt-lock" onClick={open} aria-label="Accès à l'aperçu du site" title="Accès à l'aperçu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1.3" />
          </svg>
        </button>
      </header>

      <section className="mt-body" aria-labelledby="mt-title">
        <h1 className="mt-title" id="mt-title">
          <span className="mt-l">
            <span>Notre site web</span>
          </span>
          <span className="mt-l">
            <span>fait peau neuve.</span>
          </span>
          <span className="mt-l">
            <span>
              <em>On revient bientôt !</em>
            </span>
          </span>
        </h1>
        <p className="mt-text">En attendant, contactez-nous.</p>
        <dl className="mt-contact">
          <div>
            <dt>Téléphone</dt>
            <dd>
              <a href="tel:+261386049449">+261 38 60 494 49</a>
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href="mailto:admin@tropicomagency.com">admin@tropicomagency.com</a>
            </dd>
          </div>
        </dl>
        <div className="mt-social">
          <p>Ou suivez-nous sur les réseaux sociaux</p>
          <a className="mt-fb" href="https://www.facebook.com/share/1DcJ6iKm27/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Notre page Facebook" title="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
            </svg>
          </a>
        </div>
      </section>

      {/* accès à l'aperçu : code statique (lib/preview.ts), sans base de données */}
      <dialog
        ref={dialogRef}
        className="mt-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        aria-labelledby="mt-dialog-t"
      >
        <form className="mt-form" onSubmit={submit}>
          <button type="button" className="mt-close" onClick={() => dialogRef.current?.close()} aria-label="Fermer">
            ✕
          </button>
          <span className="mt-form-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h2 id="mt-dialog-t">Un avant-goût ?</h2>
          <label>
            Code d’accès
            <input name="code" autoComplete="off" autoCapitalize="characters" spellCheck={false} required autoFocus />
          </label>
          {error && <small className="mt-error">{error}</small>}
          <button type="submit" className="mt-submit" disabled={busy}>
            {busy ? "Un instant…" : "Goûter au nouveau site"}
          </button>
        </form>
      </dialog>
    </main>
  );
}
