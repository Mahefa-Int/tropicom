import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { deleteMessage, setMessageRead } from "@/lib/admin/actions";
import { formatDateTime } from "@/lib/admin/util";
import { PageHead } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Icons } from "@/components/admin/icons";

export const metadata = { title: "Message" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const m = (await db.select().from(schema.messages).where(eq(schema.messages.id, Number(id))).limit(1))[0];
  if (!m) notFound();
  // ouvert = lu
  if (!m.isRead) await db.update(schema.messages).set({ isRead: true }).where(eq(schema.messages.id, m.id));

  return (
    <>
      <PageHead title={m.subject || `Message de ${m.name}`} crumb={{ href: "/admin/messages", label: "Messages" }}>
        <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re : " + (m.subject || "votre demande"))}`} className="adm-btn adm-btn--primary">
          {Icons.mail}
          Répondre
        </a>
        <ConfirmButton action={setMessageRead.bind(null, m.id, false)} confirm={false} className="adm-btn">
          Marquer non lu
        </ConfirmButton>
        <ConfirmButton action={deleteMessage.bind(null, m.id)} confirm="Supprimer ce message ?" className="adm-btn adm-btn--danger" label="Supprimer">
          {Icons.trash}
        </ConfirmButton>
      </PageHead>
      <div className="adm-grid adm-grid--2">
        <section className="adm-card">
          <p className="adm-msg-body">{m.body}</p>
        </section>
        <section className="adm-card">
          <h2>Expéditeur</h2>
          <dl className="adm-kv">
            <dt>Nom</dt>
            <dd>{m.name}</dd>
            <dt>E-mail</dt>
            <dd><a href={`mailto:${m.email}`}>{m.email}</a></dd>
            <dt>Téléphone</dt>
            <dd>{m.phone ?? "—"}</dd>
            <dt>Établissement</dt>
            <dd>{m.company ?? "—"}</dd>
            <dt>Origine</dt>
            <dd>{m.source}</dd>
            <dt>Reçu le</dt>
            <dd>{formatDateTime(m.createdAt)}</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
