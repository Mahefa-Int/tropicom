import type { Metadata, Viewport } from "next";
import { DM_Sans, Bangers } from "next/font/google";
import "./globals.css";
import PageViewTracker from "@/components/PageViewTracker";

// Polices (auto-hébergées par Next.js) : DM Sans avec l'axe optique, comme sur la maquette
const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap",
});

/** adresse publique du site (liens absolus : aperçus de partage, sitemap, adresses canoniques) */
const SITE_URL = process.env.SITE_URL || "https://www.tropicomagency.com";
const DESCRIPTION =
  "Agence de marketing digital et d'automatisation dédiée aux hôtels, lodges et tour-opérateurs de l'océan Indien : marque, contenus, réservations directes, réseaux sociaux.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Tropi'Com — Agence de marketing digital pour le tourisme, océan Indien", template: "%s — Tropi'Com" },
  description: DESCRIPTION,
  applicationName: "Tropi'Com",
  keywords: ["agence marketing digital Madagascar", "marketing hôtelier", "tourisme océan Indien", "réservations directes", "création de contenu", "site web hôtel", "réseaux sociaux tourisme"],
  authors: [{ name: "Tropi'Com" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Tropi'Com",
    locale: "fr_FR",
    url: "/",
    title: "Tropi'Com — Agence de marketing digital pour le tourisme, océan Indien",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${bangers.variable}`}>
      {/* suppressHydrationWarning : certaines extensions du navigateur ajoutent des attributs au <body> */}
      <body suppressHydrationWarning>
        {children}
        {/* compteur de pages vues (admin → Statistiques) */}
        <PageViewTracker />
      </body>
    </html>
  );
}
