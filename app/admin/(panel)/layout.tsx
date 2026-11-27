import { and, count, eq, gt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import Sidebar from "@/components/admin/Sidebar";

/** cadre de l'admin connecté : barre latérale + contenu (chaque page re-vérifie aussi l'utilisateur) */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [[{ n }], [{ r }]] = await Promise.all([
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.isRead, false)),
    // rendez-vous à venir (confirmés)
    db
      .select({ r: count() })
      .from(schema.appointments)
      .where(and(eq(schema.appointments.status, "confirmed"), gt(schema.appointments.endsAt, new Date()))),
  ]);
  return (
    <div className="adm-shell">
      <Sidebar user={user} unread={n} upcoming={r} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
