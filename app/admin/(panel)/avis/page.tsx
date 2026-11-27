import Link from "next/link";
import { requireUser } from "@/lib/admin/dal";
import { deleteReview, setReviewStatus } from "@/lib/admin/actions";
import { getReviewSettings, googleLinks, listReviews, relativeDate } from "@/lib/reviews";
import { Empty, PageHead } from "@/components/admin/ui";
import { Icons } from "@/components/admin/icons";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { ReviewForm, ReviewSettingsForm } from "@/components/admin/ReviewForms";

export const metadata = { title: "Avis" };

export default async function ReviewsPage() {
  await requireUser();
  const [list, s] = await Promise.all([listReviews(false), getReviewSettings()]);
  const links = googleLinks(s.placeId);
  return (
    <>
      <PageHead title="Avis" text="Les avis clients affichés sur l’accueil (« Nos clients en parlent »), copiés depuis votre fiche Google.">
        <a href={links.url} target="_blank" rel="noopener" className="adm-btn">
          {Icons.external}
          Ouvrir la fiche Google
        </a>
      </PageHead>
      <div className="adm-grid adm-grid--2">
        <div className="adm-stack">
          <section className="adm-card">
            <h2>Avis ({list.length})</h2>
            {list.length ? (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Avis</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/admin/avis/${r.id}`} className="adm-strong">
                          {r.author}
                        </Link>
                        <span className="adm-sub">
                          {"★".repeat(r.rating)} · {relativeDate(r.reviewDate) || "sans date"}
                        </span>
                      </td>
                      <td style={{ maxWidth: 320 }}>{r.text.length > 110 ? r.text.slice(0, 110) + "…" : r.text}</td>
                      <td>{r.status === "published" ? <span className="adm-status adm-status--pub">Publié</span> : <span className="adm-status adm-status--draft">Masqué</span>}</td>
                      <td>
                        <div className="adm-actions">
                          <ConfirmButton action={setReviewStatus.bind(null, r.id, r.status === "published" ? "draft" : "published")} confirm={false} className="adm-btn adm-btn--sm">
                            {r.status === "published" ? "Masquer" : "Publier"}
                          </ConfirmButton>
                          <Link href={`/admin/avis/${r.id}`} className="adm-btn adm-btn--sm" aria-label="Modifier">
                            {Icons.edit}
                          </Link>
                          <ConfirmButton action={deleteReview.bind(null, r.id)} confirm="Supprimer cet avis ?" label="Supprimer">
                            {Icons.trash}
                          </ConfirmButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty title="Aucun avis pour l’instant" text="Tant qu’aucun avis n’est publié, l’accueil affiche les témoignages de la maquette." />
            )}
          </section>
          <ReviewForm />
        </div>
        <ReviewSettingsForm rating={s.rating} total={s.total} placeId={s.placeId} />
      </div>
    </>
  );
}
