"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// dernière page comptée : évite un double comptage (double rendu de React en développement)
let last = "";

/** compte une page vue à chaque page affichée (voir app/api/track/route.ts) ; rien pour l'admin */
export default function PageViewTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin") || path === last) return;
    last = path;
    const body = JSON.stringify({ path });
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
