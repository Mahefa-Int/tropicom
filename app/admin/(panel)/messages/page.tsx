import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { formatDateTime } from "@/lib/admin/util";
import { Empty, PageHead } from "@/components/admin/ui";

export const metadata = { title: "Messages" };

const SOURCES: Record<string, string> = { contact: "Contact", diagnostic: "Diagnostic", rapport: "Rapport", carrieres: "Candidature" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ filtre?: string }> }) {
  await requireUser();
  const { filtre } = await searchParams;
  const list = await db
    .select()
    .from(schema.messages)
    .where(filtre === "non-lus" ? eq(schema.messages.isRead, false) : undefined)
    .orderBy(desc(schema.messages.createdAt));
  return (
    <>
      <PageHead title="Messages" text="Les demandes envoyées par les formulaires du site." />
      <section className="adm-card">
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Link href="/admin/messages" className={"adm-btn adm-btn--sm" + (filtre ? " adm-btn--ghost" : "")}>Tous</Link>
          <Link href="/admin/messages?filtre=non-lus" className={"adm-btn adm-btn--sm" + (filtre ? "" : " adm-btn--ghost")}>Non lus</Link>
        </div>
        {list.length ? (
          <table className="adm-table">
            <thead>
              <tr>
                <th>De</th>
                <th>Objet</th>
                <th>Origine</th>
                <th>Reçu</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className={m.isRead ? undefined : "adm-msg-unread"}>
                  <td>
                    <Link href={`/admin/messages/${m.id}`} className="adm-strong" style={{ fontWeight: m.isRead ? 400 : 600 }}>{m.name}</Link>
                    <span className="adm-sub">{m.email}</span>
                  </td>
                  <td>
                    <Link href={`/admin/messages/${m.id}`}>{m.subject || m.body.slice(0, 80)}</Link>
                  </td>
                  <td><span className="adm-badge adm-badge--teal">{SOURCES[m.source] ?? m.source}</span></td>
                  <td>{formatDateTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty title={filtre ? "Aucun message non lu" : "Aucun message"} text="Une fois le site relié, les formulaires de contact et de diagnostic arriveront ici." />
        )}
      </section>
    </>
  );
}
