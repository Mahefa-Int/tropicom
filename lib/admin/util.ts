/** outils partagés (serveur et navigateur) */

/** « Être trouvé à l'instant précis » → « etre-trouve-a-l-instant-precis » */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const formatDate = (d: Date | string | null | undefined) => (d ? fmt.format(new Date(d)) : "—");
export const formatDateTime = (d: Date | string | null | undefined) => (d ? fmtTime.format(new Date(d)) : "—");

export type FormState = { error?: string; fields?: Record<string, string>; ok?: string } | undefined;
