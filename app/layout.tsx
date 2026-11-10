import type { Metadata, Viewport } from "next";
import { DM_Sans, Bangers } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Tropi'Com",
  description:
    "Agence de marketing digital et d'automatisation dédiée aux hôtels, lodges et tour-opérateurs de l'Océan Indien.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${bangers.variable}`}>
      <body>{children}</body>
    </html>
  );
}
