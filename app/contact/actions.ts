"use server";

/**
 * Formulaire de la page Contact : enregistre la demande dans la table `messages` (admin → Messages).
 * Action publique : validation stricte, champ piège anti-robots et limite d'envois par adresse IP.
 */
import { headers } from "next/headers";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { BUDGETS, PRIORITIES, SERVICES } from "@/lib/contact";

export type ContactState = { ok?: boolean; error?: string; fields?: Record<string, string> };

const sent = new Map<string, { n: number; until: number }>();

const Schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom et prénom.").max(160),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(190),
  phone: z.string().trim().max(60),
  project: z.string().trim().max(160),
  message: z.string().trim().max(5000),
  budget: z.enum(BUDGETS, { message: "Choisissez un budget." }),
  source: z.string().trim().max(200),
});

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  const get = (k: string) => String(form.get(k) ?? "");
  const fields = { name: get("name"), email: get("email"), phone: get("phone"), project: get("project"), message: get("message"), source: get("source") };

  // champ invisible : rempli = robot. On répond « envoyé » sans rien enregistrer.
  if (get("website")) return { ok: true };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const s = sent.get(ip);
  if (s && s.n >= 5 && s.until > Date.now()) {
    return { error: "Vous avez déjà envoyé plusieurs messages. Réessayez dans quelques minutes, ou écrivez-nous par e-mail.", fields };
  }

  const parsed = Schema.safeParse({ ...fields, budget: get("budget") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire incomplet.", fields };
  const d = parsed.data;
  const priorities = form.getAll("priority").map(String).filter((v) => (PRIORITIES as readonly string[]).includes(v));
  const services = form.getAll("service").map(String).filter((v) => (SERVICES as readonly string[]).includes(v));

  const body = [
    d.message || "(pas de message)",
    "",
    `Priorité marketing : ${priorities.join(", ") || "—"}`,
    `Services recherchés : ${services.join(", ") || "—"}`,
    `Budget prévu : ${d.budget}`,
    `Nous a connus par : ${d.source || "—"}`,
  ].join("\n");

  try {
    await db.insert(schema.messages).values({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      company: d.project || null,
      subject: d.project ? `Projet : ${d.project}` : "Demande de contact",
      body,
      source: "contact",
    });
  } catch (e) {
    console.error("Contact : enregistrement impossible", e);
    return { error: "L'envoi a échoué. Réessayez, ou écrivez-nous directement à admin@tropicomagency.com.", fields };
  }

  sent.set(ip, { n: (s && s.until > Date.now() ? s.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
  return { ok: true };
}
