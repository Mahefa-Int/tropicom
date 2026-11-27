import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, maintenanceOn, previewToken } from "@/lib/preview";

/**
 * Proxy (ex-« middleware » de Next.js).
 * 1. /admin : sans cookie de session, renvoi vers la page de connexion. La vraie vérification (session valide en base)
 *    est faite sur chaque page et chaque action par lib/admin/dal.ts. Toutes les pages de l'admin sont exclues
 *    des moteurs de recherche (en-tête X-Robots-Tag).
 * 0. tropicomagency.com (sans www) redirige vers www.tropicomagency.com.
 * 2. Maintenance (lib/preview.ts) : les pages publiques affichent /maintenance (l'adresse reste la même),
 *    sauf pour qui s'est connecté à l'aperçu (cadenas de la page de maintenance).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // une seule adresse pour Google : tropicomagency.com → www.tropicomagency.com (redirection permanente)
  if (req.headers.get("host") === "tropicomagency.com") {
    return NextResponse.redirect(new URL(pathname + req.nextUrl.search, "https://www.tropicomagency.com"), 308);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // seule page accessible sans être connecté : la connexion
    const isPublic = pathname === "/admin/connexion";
    const hasCookie = req.cookies.has("tc_admin");
    if (!isPublic && !hasCookie && !pathname.startsWith("/admin/api/")) {
      return NextResponse.redirect(new URL("/admin/connexion", req.nextUrl));
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (maintenanceOn() && pathname !== "/maintenance") {
    const token = req.cookies.get(PREVIEW_COOKIE)?.value;
    if (!token || token !== (await previewToken())) {
      const res = NextResponse.rewrite(new URL("/maintenance", req.nextUrl));
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
  }
  return NextResponse.next();
}

export const config = {
  // tout sauf les fichiers techniques, les images envoyées (/media), l'API d'aperçu, le compteur de visites et les fichiers statiques
  matcher: ["/((?!_next/|api/preview|api/track|media/|favicon|icon|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]{2,5}$).*)"],
};
