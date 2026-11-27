/**
 * Prise de rendez-vous : règles des créneaux, partagées par la fenêtre (navigateur) et le serveur.
 * Du lundi au vendredi, 9 h – 12 h et 14 h – 17 h heure de Madagascar, créneaux toutes les 30 min,
 * 24 h de délai minimum, réservable 6 semaines à l'avance. Les créneaux déjà réservés sont retirés.
 * Pour changer les horaires : modifier PERIODS / NOTICE_H / HORIZON_DAYS ci-dessous.
 */

export type BookingType = { id: string; name: string; dur: number; text: string; tag?: string };
export const TYPES: BookingType[] = [
  { id: "diagnostic", name: "Diagnostic offert", dur: 30, text: "On fait le point sur votre présence digitale et vos priorités. Sans engagement.", tag: "Offert" },
  { id: "projet", name: "Point projet", dur: 45, text: "Pour avancer sur un projet en cours, un devis ou une campagne." },
];

export const ZONES = [
  { id: "Indian/Antananarivo", label: "Madagascar" },
  { id: "Indian/Reunion", label: "La Réunion" },
  { id: "Indian/Mauritius", label: "Maurice" },
  { id: "Europe/Paris", label: "France" },
] as const;

export const AGENCY_TZ = "Indian/Antananarivo";
const AGENCY_TZ_OFFSET = 3; // Madagascar = UTC+3, sans heure d'été
const PERIODS = [
  [9, 12],
  [14, 17],
];
const STEP_MIN = 30;
const HORIZON_DAYS = 42;
const NOTICE_H = 24;

/** plage déjà occupée (instants UTC en millisecondes) */
export type Busy = { s: number; e: number };

/** tous les créneaux libres (instants UTC) sur l'horizon, sans ceux qui chevauchent un rendez-vous */
export function buildSlots(dur: number, busy: Busy[] = [], now = Date.now()) {
  const out: number[] = [];
  const base = new Date(now);
  for (let d = 0; d < HORIZON_DAYS; d++) {
    const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d));
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    for (const [a, b] of PERIODS) {
      for (let m = a * 60; m + dur <= b * 60; m += STEP_MIN) {
        const t = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, m) - AGENCY_TZ_OFFSET * 3600000;
        if (t < now + NOTICE_H * 3600000) continue;
        const end = t + dur * 60000;
        if (busy.some((x) => t < x.e && end > x.s)) continue;
        out.push(t);
      }
    }
  }
  return out;
}

export const zoneLabel = (tz: string) => ZONES.find((z) => z.id === tz)?.label ?? tz;
export const hhmm = (t: number, tz: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(t).replace(":", " h ");
export const longDate = (t: number, tz: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(t);
export const icsDate = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** invitation d'agenda (.ics) */
export function icsFile({ start, end, title, description, uid }: { start: number; end: number; title: string; description: string; uid: string }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tropi'Com//Rendez-vous//FR",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
