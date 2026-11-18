import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";

/**
 * Couche d'accès centrale (recommandation Next.js) : TOUTE page ou action de l'admin passe par ici.
 * - getAdminUser() : utilisateur connecté ou null (mémorisé pendant un rendu) ;
 * - requireUser() : redirige vers /admin/connexion si personne n'est connecté.
 * Un seul compte : l'administrateur (créé avec « npm run db:admin »).
 */
export type AdminUser = { id: number; name: string; email: string; role: "admin" | "editor" };

export const getAdminUser = cache(async (): Promise<AdminUser | null> => readSession());

export async function requireUser() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/connexion");
  return user;
}
