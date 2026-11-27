"use server";

/**
 * Prise de rendez-vous : actions publiques (fenêtre « Prendre rendez-vous »).
 * - getBusy : plages déjà réservées (pour masquer ces créneaux)
 * - bookAppointment : vérifie que le créneau est valide et libre, enregistre, envoie les e-mails
 */
import { headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { AGENCY_TZ, TYPES, ZONES, buildSlots, hhmm, icsFile, longDate, zoneLabel, type Busy } from "@/lib/booking";
import { mailReady, sendMail, teamEmail } from "@/lib/mailer";

async function busy(): Promise<Busy[]> {
  const rows = await db
    .select({ s: schema.appointments.startsAt, e: schema.appointments.endsAt })
    .from(schema.appointments)
    .where(and(eq(schema.appointments.status, "confirmed"), gt(schema.appointments.endsAt, new Date())));
  return rows.map((r) => ({ s: r.s.getTime(), e: r.e.getTime() }));
}

/** plages réservées (la base indisponible ne doit pas casser la fenêtre) */
export async function getBusy(): Promise<Busy[]> {
  return busy().catch((e) => {
    console.error("Rendez-vous : base indisponible", e);
    return [];
  });
}

export type BookResult = { ok: true; mailed: boolean } | { ok: false; error: string; taken?: boolean };

const Input = z.object({
  start: z.number().int(),
  type: z.string().refine((v) => TYPES.some((t) => t.id === v), "Type de rendez-vous inconnu."),
  tz: z.enum(ZONES.map((z) => z.id) as [string, ...string[]]),
  name: z.string().trim().min(2, "Indiquez votre nom et prénom.").max(160),
  company: z.string().trim().max(160),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(190),
  phone: z.string().trim().max(60),
  mode: z.enum(["visio", "tel"]),
  need: z.string().trim().max(3000),
});

const recent = new Map<string, { n: number; until: number }>();

export async function bookAppointment(raw: unknown): Promise<BookResult> {
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire incomplet." };
  const d = parsed.data;

  // limite : 4 réservations par adresse IP et par heure
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const r = recent.get(ip);
  if (r && r.n >= 4 && r.until > Date.now()) return { ok: false, error: "Trop de réservations depuis votre connexion. Écrivez-nous à admin@tropicomagency.com." };

  const type = TYPES.find((t) => t.id === d.type)!;
  let taken: Busy[];
  try {
    taken = await busy();
  } catch (e) {
    console.error("Rendez-vous : base indisponible", e);
    return { ok: false, error: "La réservation a échoué. Réessayez, ou écrivez-nous à admin@tropicomagency.com." };
  }
  // le créneau doit faire partie des créneaux proposés et être encore libre
  if (!buildSlots(type.dur, taken).includes(d.start)) {
    return { ok: false, taken: true, error: "Ce créneau vient d'être réservé ou n'est plus disponible. Choisissez-en un autre." };
  }

  const start = d.start;
  const end = start + type.dur * 60000;
  const [res] = await db.insert(schema.appointments).values({
    startsAt: new Date(start),
    endsAt: new Date(end),
    kind: type.name,
    name: d.name,
    company: d.company || null,
    email: d.email,
    phone: d.phone || null,
    mode: d.mode,
    need: d.need || null,
    timezone: d.tz,
  });
  recent.set(ip, { n: (r && r.until > Date.now() ? r.n : 0) + 1, until: Date.now() + 3600 * 1000 });

  // e-mails : confirmation au client (à son heure) + avis à l'équipe (heure de Madagascar)
  if (!mailReady()) return { ok: true, mailed: false };
  const when = (tz: string) => `${longDate(start, tz)} de ${hhmm(start, tz)} à ${hhmm(end, tz)} (heure : ${zoneLabel(tz)})`;
  const how = d.mode === "visio" ? "En visio : le lien de la réunion vous sera envoyé avant le rendez-vous." : `Par téléphone : nous vous appelons${d.phone ? ` au ${d.phone}` : ""}.`;
  const ics = icsFile({
    start,
    end,
    title: `${type.name} · Tropi'Com`,
    description: `Rendez-vous avec l'équipe Tropi'Com.\n${how}`,
    uid: `rdv-${res.insertId}@tropicomagency.com`,
  });
  const first = d.name.split(" ")[0];
  const mailed = await sendMail({
    to: d.email,
    replyTo: teamEmail(),
    subject: `Votre rendez-vous avec Tropi'Com : ${longDate(start, d.tz)} à ${hhmm(start, d.tz)}`,
    ics,
    text: [
      `Bonjour ${first},`,
      "",
      `Votre rendez-vous « ${type.name} » (${type.dur} min) est bien réservé :`,
      when(d.tz),
      "",
      how,
      "",
      "L'invitation pour votre agenda est jointe à cet e-mail.",
      "Besoin de changer ou d'annuler ? Répondez simplement à cet e-mail.",
      "",
      "À bientôt,",
      "L'équipe Tropi'Com",
    ].join("\n"),
  });
  await sendMail({
    to: teamEmail(),
    replyTo: d.email,
    subject: `Nouveau rendez-vous : ${d.name} · ${longDate(start, AGENCY_TZ)} à ${hhmm(start, AGENCY_TZ)}`,
    ics,
    text: [
      `${type.name} (${type.dur} min)`,
      when(AGENCY_TZ),
      "",
      `Nom : ${d.name}`,
      `Structure : ${d.company || "—"}`,
      `E-mail : ${d.email}`,
      `Téléphone : ${d.phone || "—"}`,
      `Échange : ${d.mode === "visio" ? "visio (envoyer le lien)" : "téléphone"}`,
      `Fuseau du client : ${zoneLabel(d.tz)}`,
      "",
      `Besoin : ${d.need || "—"}`,
      "",
      "Tous les rendez-vous : admin → Rendez-vous.",
    ].join("\n"),
  });
  return { ok: true, mailed };
}
