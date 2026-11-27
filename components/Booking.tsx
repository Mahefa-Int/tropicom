"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CtaIcon from "./CtaIcon";
import GlowField, { type Glow } from "./GlowField";
import Fireflies from "./Fireflies";
import { TYPES, ZONES, buildSlots, hhmm, longDate, type BookingType, type Busy } from "@/lib/booking";
import { bookAppointment, getBusy } from "@/lib/booking-actions";

/**
 * Prise de rendez-vous.
 * Parcours : jour → créneau (affiché dans le fuseau du visiteur) → coordonnées → confirmation. Règles des créneaux : lib/booking.ts ; les créneaux déjà réservés
 * sont masqués. La réservation est enregistrée (admin → Rendez-vous) et confirmée par e-mail si l'envoi
 * est configuré (lib/mailer.ts).
 */

const dayKey = (t: number, tz: string) => new Intl.DateTimeFormat("fr-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(t); // AAAA-MM-JJ
/** morceau de date dans le fuseau choisi (« lun. », « 16 », « déc. ») */
const fmtPart = (t: number, tz: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, ...o }).format(t).replace(".", "");
const hourIn = (t: number, tz: string) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(t));

/* fond de la fenêtre : halos et lucioles de la charte */
const RIBBON_GLOWS: Glow[] = [
  { x: 1180, y: 60, rx: 520, ry: 420, c: "247, 194, 39", a: 0.28, dx: 60, dy: 40, sp: 0.35, m: -20 },
  { x: 120, y: 620, rx: 520, ry: 420, c: "222, 11, 125", a: 0.3, dx: 70, dy: 40, sp: 0.3, ph: 2, m: 20 },
  { x: 700, y: 700, rx: 460, ry: 360, c: "62, 157, 158", a: 0.22, dx: 60, dy: 40, sp: 0.3, ph: 4, m: 10 },
];
const ffLeft = (_i: number, r: (a: number, b: number) => number) => r(2, 98);
const ffTop = (_i: number, r: (a: number, b: number) => number) => r(5, 95);

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DOW = ["L", "M", "M", "J", "V", "S", "D"];


/** popup : version compacte pour la fenêtre « Prendre rendez-vous » (page Contact) — la carte seule, sans titre,
 * sans le choix du type (rendez-vous de 30 min), ni colonne de gauche avant le choix du créneau, ni les 3 étapes */
export default function Booking({ popup = false }: { popup?: boolean }) {
  const [type, setType] = useState<BookingType>(TYPES[0]);
  const [busy, setBusy] = useState<Busy[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mailed, setMailed] = useState(false);
  const [tz, setTz] = useState<string>(ZONES[0].id);
  const [step, setStep] = useState<"choose" | "form" | "sending" | "done">("choose");
  const [phase, setPhase] = useState(0);
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
  // créneaux déjà réservés (base) : chargés à l'ouverture
  useEffect(() => {
    getBusy().then(setBusy);
  }, []);
  useEffect(() => setSlots(buildSlots(type.dur, busy)), [type, busy]);

  const byDay = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const t of slots) {
      const k = dayKey(t, tz);
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return m;
  }, [slots, tz]);

  const firstKey = byDay.keys().next().value as string | undefined;

  // fenêtre : premier jour libre choisi d'office ; flèches du ruban = défilement d'un écran
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (popup && firstKey && (!day || !byDay.has(day))) setDay(firstKey);
  }, [popup, day, firstKey, byDay]);
  const slide = (dir: number) => stripRef.current?.scrollBy({ left: dir * stripRef.current.clientWidth * 0.8, behavior: "smooth" });
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
  // envoi : le serveur revérifie que le créneau est libre, enregistre et envoie les e-mails.
  // Écran de chargement pendant au moins 1,8 s (vérification → enregistrement → confirmation), plus rassurant.
  const submit = async () => {
    if (!slot) return;
    setSending(true);
    setError("");
    setPhase(0);
    setStep("sending");
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1300);
    const [res] = await Promise.all([
      bookAppointment({ start: slot, type: type.id, tz, ...form }).catch(() => ({ ok: false as const, error: "La réservation a échoué. Réessayez, ou écrivez-nous à admin@tropicomagency.com." })),
      new Promise((r) => setTimeout(r, 1800)),
    ]);
    clearTimeout(t1);
    clearTimeout(t2);
    setSending(false);
    if (res.ok) {
      setMailed(res.mailed);
      setStep("done");
      getBusy().then(setBusy);
      return;
    }
    setError(res.error);
    if ("taken" in res && res.taken) {
      getBusy().then(setBusy);
      setSlot(null);
      setStep("choose");
    } else {
      setStep("form");
    }
  };

  const reset = () => {
    setStep("choose");
    setSlot(null);
    setDay(null);
  };

  return (
    <section className={popup ? "bk bk--popup" : "bk"}>
      {!popup && (
        <header className="bk-head" data-reveal>
          <p className="bk-demo">Démo de présentation · aucune réservation n’est enregistrée</p>
          <h1 className="bk-title">
            <span className="bk-gold">Prenez rendez-vous</span> avec l’équipe.
          </h1>
          <p className="bk-lead">Choisissez un créneau, vous recevez aussitôt l’invitation et le lien de la visio.</p>
        </header>
      )}

      {/* apparition sur un conteneur fixe : la classe de la carte change à chaque étape */}
      <div className="bk-card-wrap" data-reveal={popup ? undefined : true}>
      <div className={"bk-card is-" + step}>
        {popup && (
          <>
            <GlowField glows={RIBBON_GLOWS} breath={0.7} />
            <Fireflies className="bkr-fireflies" count={12} left={ffLeft} top={ffTop} />
          </>
        )}
        {/* ---------- colonne de gauche : le rendez-vous (page /rendez-vous seulement ; en fenêtre, résumé en haut du formulaire) ---------- */}
        {!popup && (
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
              {!popup && <p className="bk-sum-type">{type.name}</p>}
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
                  {form.mode === "visio" ? "Visio" : "Appel téléphonique"}
                </li>
              </ul>
              {step === "form" && (
                <button type="button" className="bk-link" onClick={() => setStep("choose")}>
                  ← Changer de créneau
                </button>
              )}
            </>
          )}
          {!popup && (
          <div className="bk-host">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/agence/equipe.webp" alt="" />
            <span>
              <b>L’équipe Tropi’Com</b>
              <small>Antananarivo · répond en français et en anglais</small>
            </span>
          </div>
          )}
        </aside>
        )}

        {/* ---------- étape 1 (fenêtre de la page Contact) : ruban de jours + heures ---------- */}
        {step === "choose" && popup && (
          <div className="bkr">
            <h2 className="bkr-title">
              Choisissez <em>un moment.</em>
            </h2>

            <div className="bkr-strip">
              <button type="button" className="bkr-arrow" onClick={() => slide(-1)} aria-label="Jours précédents">
                <Ico d="M12 4 6 10l6 6" />
              </button>
              <div className="bkr-days" ref={stripRef} role="listbox" aria-label="Jours disponibles">
                {[...byDay.keys()].map((k, i) => {
                  const t0 = byDay.get(k)![0];
                  const on = day === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={"bkr-day" + (on ? " is-on" : "")}
                      style={{ "--i": i } as React.CSSProperties}
                      onClick={() => {
                        setDay(k);
                        setSlot(null);
                        setError("");
                      }}
                    >
                      <small>{fmtPart(t0, tz, { weekday: "short" })}</small>
                      <b>{fmtPart(t0, tz, { day: "numeric" })}</b>
                      <small>{fmtPart(t0, tz, { month: "short" })}</small>
                      <i>{byDay.get(k)!.length} créneaux</i>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="bkr-arrow" onClick={() => slide(1)} aria-label="Jours suivants">
                <Ico d="m8 4 6 6-6 6" />
              </button>
            </div>

            {error && (
              <p className="bk-error" role="alert">
                {error}
              </p>
            )}

            {day && byDay.get(day) && (
              <div className="bkr-times" key={day + tz}>
                {(
                  [
                    ["Matin", "M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6 15 15M5 15l1.4-1.4M13.6 6.4 15 5M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", (t: number) => hourIn(t, tz) < 12],
                    ["Après-midi", "M3 13h14M5 13a5 5 0 0 1 10 0M10 4v2M4.3 7.3l1.4 1.4M15.7 7.3l-1.4 1.4M7 16h6", (t: number) => hourIn(t, tz) >= 12],
                  ] as const
                ).map(([label, icon, keep]) => {
                  const list = byDay.get(day)!.filter(keep);
                  if (!list.length) return null;
                  return (
                    <div key={label} className="bkr-group">
                      <p>
                        <Ico d={icon} />
                        {label}
                      </p>
                      <div className="bkr-pills">
                        {list.map((t, i) => (
                          <button
                            key={t}
                            type="button"
                            className={"bkr-time" + (slot === t ? " is-on" : "")}
                            style={{ "--i": i } as React.CSSProperties}
                            onClick={() => {
                              setSlot(t);
                              setError("");
                            }}
                          >
                            {hhmm(t, tz)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bkr-foot">
              <label className="bk-tz">
                <Ico d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM2.5 10h15M10 2.5c2.2 2.3 2.2 12.7 0 15M10 2.5c-2.2 2.3-2.2 12.7 0 15" />
                Heures :
                <select value={tz} onChange={(e) => setTz(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="cta bkr-next" disabled={!slot} onClick={() => setStep("form")}>
                <CtaIcon />
                <span className="cta-label">{slot ? `Suivant · ${hhmm(slot, tz)}` : "Choisissez une heure"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------- étape 1 (page /rendez-vous) : calendrier + créneaux ---------- */}
        {step === "choose" && !popup && (
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
            </div>

            <div className="bk-slots">
              {/* fuseau horaire : en haut de la colonne des créneaux */}
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
              {error && (
                <p className="bk-error" role="alert" style={{ marginBottom: 16 }}>
                  {error}
                </p>
              )}
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
                        <button key={t} type="button" className="bk-slot" onClick={() => {
                          setSlot(t);
                          setError("");
                        }}>
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
              submit();
            }}
          >
            {popup ? (
              <>
                <h2 className="bkr-title">
                  Vos <em>coordonnées.</em>
                </h2>
                <div className="bkr-recap">
                  <span>
                    <Ico d="M3 5.5h14v11H3zM3 9h14M7 3v4M13 3v4" />
                    <span className="bk-cap">{slot && longDate(slot, tz)}</span>
                  </span>
                  <span>
                    <Ico d="M10 5v5l3 2M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
                    {slot && `${hhmm(slot, tz)} – ${hhmm(end, tz)}`}
                    <small>({zoneLabel})</small>
                  </span>
                  <button type="button" onClick={() => setStep("choose")}>
                    Modifier
                  </button>
                </div>
              </>
            ) : (
              <p className="bk-k">Vos coordonnées</p>
            )}
            <div className="bk-row">
              <Field compact={popup} label="Nom et prénom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required autoComplete="name" />
              <Field compact={popup} label="Structure" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Hôtel, lodge, agence…" autoComplete="organization" />
            </div>
            <div className="bk-row">
              <Field compact={popup} label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required autoComplete="email" />
              <Field compact={popup} label="Téléphone / WhatsApp" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            </div>
            <div className={"bk-field" + (popup ? " bk-field--inline" : "")}>
              <span>Comment échanger ?</span>
              <div className="bk-seg">
                {[
                  ["visio", "Visio"],
                  ["tel", "Téléphone"],
                ].map(([v, l]) => (
                  <label key={v} className={form.mode === v ? "is-on" : undefined}>
                    <input type="radio" name="mode" value={v} checked={form.mode === v} onChange={() => setForm({ ...form, mode: v })} />
                    {popup && <Ico d={v === "visio" ? "M2.5 6.5h10v7h-10zM12.5 9l5-3v8l-5-3" : "M6 3h3l1.2 3.2-1.6 1a8.4 8.4 0 0 0 4.9 4.9l1-1.6L17.7 11v3a1.7 1.7 0 0 1-1.8 1.7A13.7 13.7 0 0 1 4.3 4.8 1.7 1.7 0 0 1 6 3z"} />}
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <label className="bk-field">
              <span className={popup ? "bk-sr" : undefined}>Votre besoin, en quelques mots</span>
              <textarea
                rows={popup ? 2 : 3}
                value={form.need}
                onChange={(e) => setForm({ ...form, need: e.target.value })}
                placeholder={popup ? "Votre besoin, en quelques mots (facultatif)" : "Ex. plus de réservations directes, refonte du site, réseaux sociaux…"}
              />
            </label>
            {error && (
              <p className="bk-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="cta bk-submit" disabled={sending}>
              <CtaIcon />
              <span className="cta-label">{sending ? "Réservation…" : "Confirmer le rendez-vous"}</span>
            </button>
          </form>
        )}

        {/* ---------- envoi en cours ---------- */}
        {step === "sending" && (
          <div className="bk-loading" role="status" aria-live="polite">
            <span className="bk-spinner" aria-hidden="true" />
            <ol className="bk-load-steps">
              {["Vérification du créneau", "Enregistrement du rendez-vous", "Envoi de la confirmation"].map((l, i) => (
                <li key={l} className={i < phase ? "is-done" : i === phase ? "is-on" : undefined}>
                  <i aria-hidden="true" />
                  {l}
                  {i === phase && "…"}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ---------- étape 3 : confirmation ---------- */}
        {step === "done" && (
          <div className="bk-done">
            <span className="bk-check" aria-hidden="true">
              <Ico d="m5 10.5 3.2 3.2L15 6.5" />
            </span>
            <h2>C’est réservé{form.name ? `, ${form.name.split(" ")[0]}` : ""}.</h2>
            <p>
              {mailed ? (
                <>
                  Un e-mail de confirmation vient de partir à <b>{form.email}</b> avec l’invitation pour votre agenda.
                </>
              ) : (
                <>
                  Votre demande est bien enregistrée. Nous vous confirmons le rendez-vous à <b>{form.email}</b>.
                </>
              )}{" "}
              {form.mode === "visio" ? "Le lien de la visio vous sera envoyé avant le rendez-vous." : "Nous vous appellerons à l’heure prévue."}
            </p>
            <p className="bk-small">Besoin de changer ou d’annuler ? Écrivez-nous à admin@tropicomagency.com.</p>
            <button type="button" className="bk-link" onClick={reset}>
              Réserver un autre créneau
            </button>
          </div>
        )}
      </div>
      </div>

      {/* ---------- comment ça se passe ---------- */}
      {!popup && (
      <ol className="bk-steps" data-reveal>
        {[
          ["Vous choisissez", "Un créneau libre, dans votre fuseau horaire. Les heures déjà réservées n’apparaissent pas."],
          ["Vous recevez", "La confirmation par e-mail avec l’invitation pour votre agenda, puis le lien de la visio avant le rendez-vous."],
          ["On échange", "30 minutes pour comprendre votre situation et repartir avec des pistes concrètes, même sans suite."],
        ].map(([t, x], i) => (
          <li key={t}>
            <span>0{i + 1}</span>
            <b>{t}</b>
            <p>{x}</p>
          </li>
        ))}
      </ol>
      )}
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

/** champ de formulaire ; compact (fenêtre) : libellé caché, affiché dans le champ */
function Field({
  label,
  value,
  onChange,
  type = "text",
  compact = false,
  ...rest
}: { label: string; value: string; onChange: (v: string) => void; type?: string; compact?: boolean; required?: boolean; placeholder?: string; autoComplete?: string }) {
  const ph = compact ? `${label}${rest.placeholder ? ` (${rest.placeholder.replace(/…$/, "")})` : ""}${rest.required ? " *" : ""}` : rest.placeholder;
  return (
    <label className="bk-field">
      <span className={compact ? "bk-sr" : undefined}>
        {label}
        {rest.required && <i aria-hidden="true"> *</i>}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} placeholder={ph} />
    </label>
  );
}
