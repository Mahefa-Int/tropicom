import type { Metadata } from "next";
import "./admin.css";

// back-office : jamais indexé
export const metadata: Metadata = {
  title: { default: "Back-office — Tropi'Com", template: "%s — Back-office Tropi'Com" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
