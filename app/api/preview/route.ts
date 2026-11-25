import { cookies } from "next/headers";
import { PREVIEW_COOKIE, PREVIEW_MAX_AGE, previewCode, previewToken } from "@/lib/preview";

/**
 * Connexion à l'aperçu du site pendant la maintenance (connexion statique, sans base de données).
 * POST { code } → cookie d'aperçu si le code est bon. DELETE → quitte l'aperçu.
 */
const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const a = attempts.get(ip);
  if (a && a.n >= 8 && a.until > Date.now()) return Response.json({ error: "Trop d'essais. Réessayez dans quelques minutes." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { code?: string };
  const ok = String(body.code ?? "").trim().toUpperCase() === previewCode();
  if (!ok) {
    attempts.set(ip, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
    return Response.json({ error: "Code incorrect." }, { status: 401 });
  }
  attempts.delete(ip);
  (await cookies()).set(PREVIEW_COOKIE, await previewToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PREVIEW_MAX_AGE,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(PREVIEW_COOKIE);
  return Response.json({ ok: true });
}
