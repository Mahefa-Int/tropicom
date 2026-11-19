"use client";

import { useEffect, useMemo, useState } from "react";
import CtaIcon from "./CtaIcon";

/**
 * Prise de rendez-vous — PROTOTYPE de présentation (aucune réservation n'est enregistrée).
 * Parcours : type de rendez-vous → jour → créneau (affiché dans le fuseau du visiteur) → coordonnées → confirmation
 * (ajout à Google Agenda, invitation .ics). Les disponibilités sont simulées : du lundi au vendredi,
 * 9 h – 12 h et 14 h – 17 h heure de Madagascar, 24 h de délai minimum, quelques créneaux déjà pris.
 * Version finale : disponibilités et réservations gérées dans l'admin et synchronisées avec Google Agenda.
 */

const TYPES = [
  { id: "diagnostic", name: "Diagnostic offert", dur: 30, text: "On fait le point sur votre présence digitale et vos priorités. Sans engagement.", tag: "Offert" },
  { id: "projet", name: "Point projet", dur: 45, text: "Pour avancer sur un projet en cours, un devis ou une campagne." },
];

const ZONES = [
  { id: "Indian/Antananarivo", label: "Madagascar" },
  { id: "Indian/Reunion", label: "La Réunion" },
  { id: "Indian/Mauritius", label: "Maurice" },
  { id: "Europe/Paris", label: "France" },
];

const AGENCY_TZ_OFFSET = 3; // Madagascar = UTC+3, sans heure d'été
const PERIODS = [
  [9, 12],
  [14, 17],
];
const STEP_MIN = 30;
const HORIZON_DAYS = 42;
const NOTICE_H = 24;

/** quelques créneaux « déjà pris », toujours les mêmes pour une date donnée */
function taken(t: number) {
  let h = 2166136261;
  for (const ch of String(t / 60000)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 7 < 2;
}

/** tous les créneaux libres (instants UTC) sur l'horizon */
function buildSlots(dur: number) {
  const now = Date.now();
  const out: number[] = [];
  const base = new Date();
  for (let d = 0; d < HORIZON_DAYS; d++) {
    const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d));
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    for (const [a, b] of PERIODS) {
      for (let m = a * 60; m + dur <= b * 60; m += STEP_MIN) {
        const t = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, m) - AGENCY_TZ_OFFSET * 3600000;
        if (t < now + NOTICE_H * 3600000 || taken(t)) continue;
        out.push(t);
      }
    }
  }
  return out;
}

const dayKey = (t: number, tz: string) => new Intl.DateTimeFormat("fr-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(t); // AAAA-MM-JJ
const hhmm = (t: number, tz: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(t).replace(":", " h ");
const longDate = (t: number, tz: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(t);
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DOW = ["L", "M", "M", "J", "V", "S", "D"];

const icsDate = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default function Booking() {
  const [type, setType] = useState(TYPES[0]);
  const [tz, setTz] = useState(ZONES[0].id);
  const [step, setStep] = useState<"choose" | "form" | "done">("choose");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [month, setMonth] = useState<[number, number] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", need: "", mode: "visio" });
  const [slots, setSlots] = useState<number[]>([]);

  // fuseau du visiteur s'il fait partie de la liste ; créneaux calculés côté navigateur (dates du jour)
  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (ZONES.some((z) => z.id === local)) setTz(local);
  }, []);
  useEffect(() => setSlots(buildSlots(type.dur)), [type]);

  const byDay = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const t of slots) {
      const k = dayKey(t, tz);
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return m;
  }, [slots, tz]);

  const firstKey = byDay.keys().next().value as string | undefined;
  const [y, mo] = month ?? (firstKey ? [Number(firstKey.slice(0, 4)), Number(firstKey.slice(5, 7)) - 1] : [new Date().getFullYear(), new Date().getMonth()]);
  const lastKey = [...byDay.keys()].pop();
  const canPrev = firstKey ? y * 12 + mo > Number(firstKey.slice(0, 4)) * 12 + Number(firstKey.slice(5, 7)) - 1 : false;
  const canNext = lastKey ? y * 12 + mo < Number(lastKey.slice(0, 4)) * 12 + Number(lastKey.slice(5, 7)) - 1 : false;
  const shift = (n: number) => {
    const v = y * 12 + mo + n;
    setMonth([Math.floor(v / 12), v % 12]);
  };

  // grille du mois (semaine commençant le lundi)
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(y, mo, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (number | null)[];
  }, [y, mo]);
  const keyOf = (d: number) => `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const todayKey = dayKey(Date.now(), tz);

  const zoneLabel = ZONES.find((z) => z.id === tz)?.label ?? tz;
  const end = slot ? slot + type.dur * 60000 : 0;
  const title = `${type.name} · Tropi'Com`;
  const gcal = slot
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${icsDate(slot)}/${icsDate(end)}&details=${encodeURIComponent(
        "Rendez-vous avec l'équipe Tropi'Com. Le lien de la visio est dans l'e-mail de confirmation.",
      )}`
    : "#";
  const downloadIcs = () => {
    if (!slot) return;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tropi'Com//Rendez-vous//FR",
      "BEGIN:VEVENT",
      `UID:${slot}-${type.id}@tropicom-agency.com`,
      `DTSTAMP:${icsDate(Date.now())}`,
      `DTSTART:${icsDate(slot)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${title}`,
      "DESCRIPTION:Rendez-vous avec l'équipe Tropi'Com.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "rendez-vous-tropicom.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reset = () => {
    setStep("choose");
    setSlot(null);
    setDay(null);
  };

  return (
    <section className="bk">
      <header className="bk-head" data-reveal>
        <p className="bk-demo">Démo de présentation · aucune réservation n’est enregistrée</p>
        <h1 className="bk-title">
          <span className="bk-gold">Prenez rendez-vous</span> avec l’équipe.
        </h1>
        <p className="bk-lead">Choisissez un créneau, vous recevez aussitôt l’invitation et le lien de la visio.</p>
      </header>

      {/* apparition sur un conteneur fixe : la classe de la carte change à chaque étape */}
      <div className="bk-card-wrap" data-reveal>
      <div className={"bk-card is-" + step}>
        {/* ---------- colonne de gauche : le rendez-vous ---------- */}
        <aside className="bk-info">
          {step === "choose" ? (
            <>
              <p className="bk-k">Type de rendez-vous</p>
              <div className="bk-types" role="radiogroup" aria-label="Type de rendez-vous">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={type.id === t.id}
                    className={"bk-type" + (type.id === t.id ? " is-on" : "")}
                    onClick={() => {
                      setType(t);
                      setSlot(null);
                    }}
                  >
                    <span className="bk-type-top">
                      <b>{t.name}</b>
                      {t.tag && <em>{t.tag}</em>}
                    </span>
                    <span className="bk-type-dur">{t.dur} min · visio ou téléphone</span>
                    <span className="bk-type-text">{t.text}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="bk-k">Votre rendez-vous</p>
              <p className="bk-sum-type">{type.name}</p>
              <ul className="bk-sum">
                <li>
                  <Ico d="M3 5.5h14v11H3zM3 9h14M7 3v4M13 3v4" />
                  <span className="bk-cap">{slot && longDate(slot, tz)}</span>
                </li>
                <li>
                  <Ico d="M10 5v5l3 2M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
                  {slot && `${hhmm(slot, tz)} – ${hhmm(end, tz)}`} · {zoneLabel}
                </li>
                <li>
                  <Ico d="M2.5 6.5h10v7h-10zM12.5 9l5-3v8l-5-3" />
                  {form.mode === "visio" ? "Visio Google Meet" : "Appel téléphonique"}
                </li>
              </ul>
              {step === "form" && (
                <button type="button" className="bk-link" onClick={() => setStep("choose")}>
                  ← Changer de créneau
                </button>
              )}
            </>
          )}
          <div className="bk-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/agence/equipe.webp" alt="" />
            <span>
              <b>L’équipe Tropi’Com</b>
              <small>Antananarivo · répond en français et en anglais</small>
            </span>
          </div>
        </aside>

        {/* ---------- étape 1 : calendrier + créneaux ---------- */}
        {step === "choose" && (
          <>
            <div className="bk-cal">
              <div className="bk-cal-head">
                <p>
                  {MONTHS[mo]} {y}
                </p>
                <div>
                  <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Mois précédent">
                    <Ico d="M12 4 6 10l6 6" />
                  </button>
                  <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Mois suivant">
                    <Ico d="m8 4 6 6-6 6" />
                  </button>
                </div>
              </div>
              <div className="bk-grid" role="grid">
                {DOW.map((d, i) => (
                  <span key={"h" + i} className="bk-dow">
                    {d}
                  </span>
                ))}
                {cells.map((d, i) => {
                  if (!d) return <span key={i} />;
                  const k = keyOf(d);
                  const free = byDay.has(k);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!free}
                      className={"bk-day" + (free ? " is-free" : "") + (day === k ? " is-on" : "") + (k === todayKey ? " is-today" : "")}
                      onClick={() => {
                        setDay(k);
                        setSlot(null);
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <label className="bk-tz">
                <Ico d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM2.5 10h15M10 2.5c2.2 2.3 2.2 12.7 0 15M10 2.5c-2.2 2.3-2.2 12.7 0 15" />
                Heures affichées :
                <select value={tz} onChange={(e) => setTz(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bk-slots">
              {day ? (
                <>
                  <p className="bk-k bk-cap">{longDate(byDay.get(day)![0], tz)}</p>
                  <div className="bk-slot-list" key={day + tz + type.id}>
                    {byDay.get(day)!.map((t) =>
                      slot === t ? (
                        <div key={t} className="bk-slot-pick">
                          <span className="bk-slot is-on">{hhmm(t, tz)}</span>
                          <button type="button" className="bk-next" onClick={() => setStep("form")}>
                            Suivant
                          </button>
                        </div>
                      ) : (
                        <button key={t} type="button" className="bk-slot" onClick={() => setSlot(t)}>
                          {hhmm(t, tz)}
                        </button>
                      ),
                    )}
                  </div>
                </>
              ) : (
                <p className="bk-empty">
                  Choisissez un jour
                  <br />
                  <small>Les jours disponibles sont en blanc.</small>
                </p>
              )}
            </div>
          </>
        )}

        {/* ---------- étape 2 : coordonnées ---------- */}
        {step === "form" && (
          <form
            className="bk-form"
            onSubmit={(e) => {
              e.preventDefault();
              setStep("done");
            }}
          >
            <p className="bk-k">Vos coordonnées</p>
            <div className="bk-row">
              <Field label="Nom et prénom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required autoComplete="name" />
              <Field label="Structure" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Hôtel, lodge, agence…" autoComplete="organization" />
            </div>
            <div className="bk-row">
              <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required autoComplete="email" />
              <Field label="Téléphone / WhatsApp" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            </div>
            <div className="bk-field">
              <span>Comment échanger ?</span>
              <div className="bk-seg">
                {[
                  ["visio", "Visio Google Meet"],
                  ["tel", "Téléphone"],
                ].map(([v, l]) => (
                  <label key={v} className={form.mode === v ? "is-on" : undefined}>
                    <input type="radio" name="mode" value={v} checked={form.mode === v} onChange={() => setForm({ ...form, mode: v })} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <label className="bk-field">
              <span>Votre besoin, en quelques mots</span>
              <textarea rows={3} value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} placeholder="Ex. plus de réservations directes, refonte du site, réseaux sociaux…" />
            </label>
            <button type="submit" className="cta bk-submit">
              <CtaIcon />
              <span className="cta-label">Confirmer le rendez-vous</span>
            </button>
          </form>
        )}

        {/* ---------- étape 3 : confirmation ---------- */}
        {step === "done" && (
          <div className="bk-done">
            <span className="bk-check" aria-hidden="true">
              <Ico d="m5 10.5 3.2 3.2L15 6.5" />
            </span>
            <h2>C’est réservé{form.name ? `, ${form.name.split(" ")[0]}` : ""}.</h2>
            <p>
              Un e-mail de confirmation part à <b>{form.email || "votre adresse"}</b> avec l’invitation{form.mode === "visio" ? " et le lien Google Meet" : ""}. Rappel automatique la veille et
              une heure avant.
            </p>
            <div className="bk-done-actions">
              <a className="bk-btn" href={gcal} target="_blank" rel="noreferrer">
                Ajouter à Google Agenda
              </a>
              <button type="button" className="bk-btn" onClick={downloadIcs}>
                Télécharger l’invitation (.ics)
              </button>
            </div>
            <p className="bk-small">Besoin de changer ? Les liens « Déplacer » et « Annuler » sont dans l’e-mail.</p>
            <button type="button" className="bk-link" onClick={reset}>
              Réserver un autre créneau
            </button>
          </div>
        )}
      </div>
      </div>

      {/* ---------- comment ça se passe ---------- */}
      <ol className="bk-steps" data-reveal>
        {[
          ["Vous choisissez", "Un créneau libre, dans votre fuseau horaire. Les heures déjà prises dans notre agenda n’apparaissent pas."],
          ["Vous recevez", "L’invitation pour votre agenda, le lien de la visio et un rappel la veille. Déplacement ou annulation en un clic."],
          ["On échange", "30 minutes pour comprendre votre situation et repartir avec des pistes concrètes, même sans suite."],
        ].map(([t, x], i) => (
          <li key={t}>
            <span>0{i + 1}</span>
            <b>{t}</b>
            <p>{x}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Field({ label, value, onChange, type = "text", ...rest }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; autoComplete?: string }) {
  return (
    <label className="bk-field">
      <span>
        {label}
        {rest.required && <i aria-hidden="true"> *</i>}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}
