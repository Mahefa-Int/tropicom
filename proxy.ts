import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (ex-« middleware » de Next.js) : contrôle rapide sur /admin.
 * Sans cookie de session, on renvoie vers la page de connexion. La vraie vérification (session valide en base)
 * est faite sur chaque page et chaque action par lib/admin/dal.ts.
 * Toutes les pages de l'admin sont exclues des moteurs de recherche (en-tête X-Robots-Tag).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // seule page accessible sans être connecté : la connexion
  const isPublic = pathname === "/admin/connexion";
  const hasCookie = req.cookies.has("tc_admin");

  if (!isPublic && !hasCookie && !pathname.startsWith("/admin/api/")) {
    const url = new URL("/admin/connexion", req.nextUrl);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
