"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import { logout } from "@/lib/admin/actions";

type Props = { user: { name: string; email: string; role: "admin" | "editor" }; unread: number; upcoming: number };

const MAIN = [
  { href: "/admin", label: "Tableau de bord", icon: Icons.dashboard },
  { href: "/admin/statistiques", label: "Statistiques", icon: Icons.chart },
];
const CONTENT = [
  { href: "/admin/articles", label: "Articles", icon: Icons.article },
  { href: "/admin/realisations", label: "Réalisations", icon: Icons.case },
  { href: "/admin/messages", label: "Messages", icon: Icons.mail, count: "unread" as const },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: Icons.calendar, count: "upcoming" as const },
  { href: "/admin/avis", label: "Avis", icon: Icons.star },
  { href: "/admin/medias", label: "Médiathèque", icon: Icons.image },
];

export default function Sidebar({ user, unread, upcoming }: Props) {
  const path = usePathname();
  const on = (href: string) =>
    href === "/admin"
      ? path === "/admin"
      : // les catégories font partie des articles : « Articles » reste actif sur /admin/categories
        path.startsWith(href) || (href === "/admin/articles" && path.startsWith("/admin/categories"));
  const counts = { unread, upcoming };
  const item = (l: { href: string; label: string; icon: React.ReactNode; count?: "unread" | "upcoming" }) => (
    <Link key={l.href} href={l.href} className={on(l.href) ? "is-on" : undefined}>
      {l.icon}
      {l.label}
      {l.count && counts[l.count] > 0 && <span className="adm-count">{counts[l.count]}</span>}
    </Link>
  );
  return (
    <aside className="adm-side">
      <div className="adm-brand">
        {/* le logo ouvre le site public dans un nouvel onglet */}
        <a href="/" target="_blank" rel="noopener" title="Voir le site" className="adm-brand-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-tropicom.svg" alt="Tropi'Com — voir le site" />
        </a>
        <span>Admin</span>
      </div>
      <nav className="adm-nav" aria-label="Back-office">
        {MAIN.map(item)}
        <p className="adm-nav-title">Contenus</p>
        {CONTENT.map(item)}
        <p className="adm-nav-title">Réglages</p>
        {item({ href: "/admin/compte", label: "Mon compte", icon: Icons.user })}
      </nav>
      <div className="adm-side-foot">
        <div className="adm-me">
          <span className="adm-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{user.name}</b>
            <small>Administrateur</small>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm adm-logout">
            {Icons.logout}
            Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  );
}
