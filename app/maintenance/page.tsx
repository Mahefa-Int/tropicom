import type { Metadata } from "next";
import Maintenance from "@/components/Maintenance";

/** Page de maintenance (affichée à la place des pages publiques par proxy.ts, voir lib/preview.ts). */
export const metadata: Metadata = {
  title: { absolute: "Tropi'Com — Notre site fait peau neuve" },
  description: "Notre site web fait peau neuve. On revient bientôt ! Contactez-nous au +261 38 60 494 49 ou admin@tropicomagency.com.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return <Maintenance />;
}
