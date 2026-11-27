import { asc, desc, gt, lte, or, eq, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/admin/dal";
import { cancelAppointment, deleteAppointment } from "@/lib/admin/actions";
import { AGENCY_TZ, hhmm, longDate, zoneLabel } from "@/lib/booking";
import { mailReady } from "@/lib/mailer";
import { Empty, PageHead } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";
import ConfirmButton from "@/components/admin/ConfirmButton";
import type { Appointment } from "@/lib/db/schema";

export const metadata = { title: "Rendez-vous" };

/** heure de Madagascar (celle de l'agence) */
const when = (a: Appointment) => {
  const s = a.startsAt.getTime();
  const day = longDate(s, AGENCY_TZ);
  return { day: day[0].toUpperCase() + day.slice(1), time: `${hhmm(s, AGENCY_TZ)} – ${hhmm(a.endsAt.getTime(), AGENCY_TZ)}` };
};

function Table({ list, upcoming }: { list: Appointment[]; upcoming: boolean }) {
  return (
    <table className="adm-table">
      <thead>
        <tr>
          <th>Date (heure de Madagascar)</th>
          <th>Client</th>
          <th>Échange</th>
          <th>Besoin</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {list.map((a) => {
          const w = when(a);
          return (
            <tr key={a.id}>
              <td>
                <span className="adm-strong">{w.day}</span>
                <span className="adm-sub">
                  {w.time} · {a.kind}
                </span>
              </td>
              <td>
                <span className="adm-strong">{a.name}</span>
                <span className="adm-sub">
                  <a href={`mailto:${a.email}`}>{a.email}</a>
                  {a.phone && ` · ${a.phone}`}
                </span>
                {a.company && <span className="adm-sub">{a.company}</span>}
              </td>
              <td>
                {a.status === "cancelled" ? (
                  <span className="adm-badge adm-badge--red">Annulé</span>
                ) : (
                  <span className="adm-badge adm-badge--teal">{a.mode === "visio" ? "Visio" : "Téléphone"}</span>
                )}
                {a.timezone !== AGENCY_TZ && <span className="adm-sub">Client : heure {zoneLabel(a.timezone)}</span>}
              </td>
              <td style={{ maxWidth: 280 }}>{a.need || "—"}</td>
              <td>
                <div className="adm-actions">
                  {upcoming && a.status === "confirmed" && (
                    <>
                      <a className="adm-btn adm-btn--sm" href={`mailto:${a.email}?subject=${encodeURIComponent(`Votre rendez-vous Tropi'Com du ${w.day}`)}`}>
                        Écrire
                      </a>
                      <ConfirmButton action={cancelAppointment.bind(null, a.id)} confirm="Annuler ce rendez-vous ? Le créneau redeviendra libre (pensez à prévenir le client)." className="adm-btn adm-btn--sm">
                        Annuler
                      </ConfirmButton>
                    </>
                  )}
                  <ConfirmButton action={deleteAppointment.bind(null, a.id)} confirm="Supprimer ce rendez-vous ?" label="Supprimer">
                    {Icons.trash}
                  </ConfirmButton>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function AppointmentsPage() {
  await requireUser();
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db
      .select()
      .from(schema.appointments)
      .where(and(eq(schema.appointments.status, "confirmed"), gt(schema.appointments.endsAt, now)))
      .orderBy(asc(schema.appointments.startsAt)),
    db
      .select()
      .from(schema.appointments)
      .where(or(eq(schema.appointments.status, "cancelled"), lte(schema.appointments.endsAt, now)))
      .orderBy(desc(schema.appointments.startsAt))
      .limit(50),
  ]);
  return (
    <>
      <PageHead title="Rendez-vous" text="Les rendez-vous pris en ligne (page Contact → « Prendre rendez-vous »)." />
      {!mailReady() && (
        <div className="adm-notice" style={{ marginBottom: 16 }}>
          {Icons.info}
          <div>
            <b>Les e-mails de confirmation ne sont pas encore envoyés.</b>
            <ol>
              <li>Les rendez-vous sont bien enregistrés ici, mais ni le client ni l’équipe ne reçoivent d’e-mail.</li>
              <li>Pour les activer : renseigner SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASS sur le serveur (voir la documentation).</li>
            </ol>
          </div>
        </div>
      )}
      <section className="adm-card" style={{ marginBottom: 16 }}>
        <h2>À venir</h2>
        {upcoming.length ? <Table list={upcoming} upcoming /> : <Empty title="Aucun rendez-vous à venir" text="Les réservations faites sur le site apparaîtront ici." />}
      </section>
      {past.length > 0 && (
        <section className="adm-card">
          <h2>Passés et annulés</h2>
          <Table list={past} upcoming={false} />
        </section>
      )}
    </>
  );
}
