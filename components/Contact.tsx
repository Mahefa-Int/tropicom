"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContact, type ContactState } from "@/app/contact/actions";
import { BUDGETS, CONTACT, PRIORITIES, SERVICES } from "@/lib/contact";
import GlowField, { type Glow } from "./GlowField";
import Fireflies from "./Fireflies";
import CtaIcon from "./CtaIcon";
import Booking from "./Booking";

/**
 * Page Contact.
 * Une seule section, au moins la hauteur de l'écran : halos rose / jaune doré / bleu ca et lucioles ;
 * disposition centrée : le titre « Et si on faisait décoller votre projet ? On vous écoute. », les coordonnées
 * (« Contactez-nous » et « Adresse »), puis le formulaire dans une carte (enregistré dans admin → Messages).
 * Textes et choix repris du contenu de l'ancienne page tropicom-agency.com/contact (hors pied de page).
 */
const GLOWS: Glow[] = [
  { x: 1150, y: 160, rx: 620, ry: 540, c: "247, 194, 39", a: 0.5, dx: 90, dy: 60, sp: 0.4, m: -40 },
  { x: 900, y: 780, rx: 620, ry: 520, c: "222, 11, 125", a: 0.55, dx: 120, dy: 60, sp: 0.35, ph: 2, m: 30 },
  { x: 60, y: 120, rx: 460, ry: 420, c: "62, 157, 158", a: 0.32, dx: 80, dy: 50, sp: 0.3, ph: 4, m: 20 },
];
const fireLeft = (_i: number, r: (a: number, b: number) => number) => r(2, 98);
const fireTop = (i: number, r: (a: number, b: number) => number) => (i % 3 === 0 ? r(15, 50) : r(50, 96));

/* coordonnées, en grandes lignes (e-mail, WhatsApp et téléphone cliquables) */
const LINES: { label: string; value: string[]; href?: string; external?: boolean }[] = [
  { label: "E-mail", value: [CONTACT.email], href: `mailto:${CONTACT.email}` },
  { label: "WhatsApp", value: [CONTACT.whatsapp.label], href: CONTACT.whatsapp.href, external: true },
  { label: "Téléphone", value: [CONTACT.phone.label], href: CONTACT.phone.href },
  { label: "Adresse · Horaires", value: [CONTACT.address, CONTACT.hours] },
];

export default function Contact() {
  const heroRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  const f = state.fields ?? {};

  // apparition
  useEffect(() => {
    const t = setTimeout(() => heroRef.current?.classList.add("in-view"), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="ct" ref={heroRef} id="formulaire" aria-labelledby="ct-title">
      <GlowField glows={GLOWS} breath={0.8} />
      <Fireflies className="ct-fireflies" count={20} left={fireLeft} top={fireTop} />

      <div className="ct-grid">
        <div className="ct-intro">
          <h1 className="ct-title" id="ct-title">
            <span className="ct-l">
              <span>Et si on faisait décoller</span>
            </span>
            <span className="ct-l">
              <span>votre projet&nbsp;?</span>
            </span>
            <span className="ct-l">
              <span>
                <em>On vous écoute.</em>
              </span>
            </span>
          </h1>
          <p className="ct-lead">Parlez-nous de votre établissement et de vos objectifs&nbsp;: quelques lignes suffisent, nous revenons vers vous.</p>
          <div className="ct-actions">
            <a className="ct-fb" href={CONTACT.facebook} target="_blank" rel="noreferrer">
              Suivez-nous sur Facebook
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
                </svg>
              </span>
            </a>
            <button type="button" className="cta ct-cta" onClick={() => bookRef.current?.showModal()}>
              <CtaIcon />
              <span className="cta-label">Prendre rendez-vous</span>
            </button>
          </div>
        </div>

          <div className="ct-card">
            {state.ok ? (
              <div className="ct-done" role="status">
                <span className="ct-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <h3>Merci, votre message est bien parti&nbsp;!</h3>
                <p>Nous revenons vers vous très vite.</p>
              </div>
            ) : (
              <form className="ct-form" action={action}>
                <div className="ct-row">
                  <label className="ct-field">
                    <span>
                      Nom &amp; Prénom <i>*</i>
                    </span>
                    <input name="name" autoComplete="name" required defaultValue={f.name} />
                  </label>
                  <label className="ct-field">
                    <span>
                      E-mail <i>*</i>
                    </span>
                    <input name="email" type="email" autoComplete="email" required defaultValue={f.email} />
                  </label>
                </div>
                <div className="ct-row">
                  <label className="ct-field">
                    <span>Téléphone / WhatsApp</span>
                    <input name="phone" type="tel" autoComplete="tel" defaultValue={f.phone} />
                  </label>
                  <label className="ct-field">
                    <span>Nom du projet / Établissement</span>
                    <input name="project" autoComplete="organization" defaultValue={f.project} />
                  </label>
                </div>
                <label className="ct-field">
                  <span>Votre projet en quelques mots</span>
                  <textarea name="message" rows={5} defaultValue={f.message} />
                </label>

                <fieldset className="ct-chips">
                  <legend>Priorité marketing</legend>
                  {PRIORITIES.map((p) => (
                    <label key={p}>
                      <input type="checkbox" name="priority" value={p} />
                      <span>{p}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="ct-chips">
                  <legend>Services recherchés</legend>
                  {SERVICES.map((s) => (
                    <label key={s}>
                      <input type="checkbox" name="service" value={s} />
                      <span>{s}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="ct-chips ct-chips--radio">
                  <legend>
                    Budget prévu <i>*</i>
                  </legend>
                  {BUDGETS.map((b) => (
                    <label key={b}>
                      <input type="radio" name="budget" value={b} required />
                      <span>{b}</span>
                    </label>
                  ))}
                </fieldset>

                <label className="ct-field">
                  <span>Comment avez-vous connu Tropi&apos;Com&nbsp;?</span>
                  <input name="source" defaultValue={f.source} />
                </label>

                {/* champ piège : invisible pour les visiteurs, rempli par les robots */}
                <label className="ct-trap" aria-hidden="true">
                  Site web
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                {state.error && (
                  <p className="ct-error" role="alert">
                    {state.error}
                  </p>
                )}
                <button type="submit" className="cta ct-submit" disabled={pending}>
                  <CtaIcon />
                  <span className="cta-label">{pending ? "Envoi…" : "Envoyer"}</span>
                </button>
              </form>
            )}
        </div>

        {/* coordonnées (ancienne page Contact) : grandes lignes numérotées, remplies de jaune au survol */}
        <ol className="ct-lines">
          {LINES.map((l, i) => {
            const inner = (
              <>
                <span className="ct-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ct-lbl">{l.label}</span>
                <span className="ct-val">
                  {l.value.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </span>
                {l.href && (
                  <span className="ct-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                  </span>
                )}
              </>
            );
            return (
              <li key={l.label}>
                {l.href ? (
                  <a className="ct-line" href={l.href} {...(l.external && { target: "_blank", rel: "noreferrer" })}>
                    {inner}
                  </a>
                ) : (
                  <div className="ct-line">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* prise de rendez-vous en fenêtre (prototype, voir components/Booking.tsx) */}
      <dialog
        ref={bookRef}
        className="bk-dialog"
        aria-label="Prendre rendez-vous"
        // fermeture uniquement par la croix (ni clic à côté, ni touche Échap)
        onCancel={(e) => e.preventDefault()}
      >
        <button type="button" className="bk-dialog-x" onClick={() => bookRef.current?.close()} aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <Booking popup />
      </dialog>
    </section>
  );
}
