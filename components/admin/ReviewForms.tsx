"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveReview, saveReviewSettings } from "@/lib/admin/actions";
import type { Review } from "@/lib/db/schema";
import ImageField from "./ImageField";
import { Icons } from "./icons";

/** ajouter (sans avis) ou modifier un avis client */
export function ReviewForm({ review }: { review?: Review }) {
  const [state, action, pending] = useActionState(saveReview, undefined);
  const f = state?.fields;
  const v = (k: string, d: string | number | null | undefined) => f?.[k] ?? (d == null ? "" : String(d));
  return (
    // après un ajout, le formulaire se vide (nouvelle clé)
    <form key={review ? review.id : state?.ok} action={action} className="adm-card adm-stack">
      <h2>{review ? "Modifier l’avis" : "Ajouter un avis"}</h2>
      {!review && <p className="adm-card-text">Copiez l’avis depuis votre fiche Google : nom, note, texte et date.</p>}
      {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
      {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
      {review && <input type="hidden" name="id" value={review.id} />}
      <div className="adm-row">
        <div className="adm-field">
          <label htmlFor="rv-author">Nom du client</label>
          <input id="rv-author" name="author" className="adm-input" defaultValue={v("author", review?.author)} maxLength={160} required />
        </div>
        <div className="adm-row adm-row--tight">
          <div className="adm-field">
            <label htmlFor="rv-rating">Note</label>
            <select id="rv-rating" name="rating" className="adm-select" defaultValue={v("rating", review?.rating ?? 5)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {"★".repeat(n)} ({n})
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label htmlFor="rv-date">Date de l’avis</label>
            <input id="rv-date" name="reviewDate" type="date" className="adm-input" defaultValue={v("reviewDate", review?.reviewDate)} />
          </div>
        </div>
      </div>
      <div className="adm-field">
        <label htmlFor="rv-text">Texte de l’avis</label>
        <textarea id="rv-text" name="text" className="adm-textarea" rows={5} defaultValue={v("text", review?.text)} required />
        <small>Un retour à la ligne crée un nouveau paragraphe.</small>
      </div>
      <div className="adm-row adm-row--media">
        <ImageField name="avatarUrl" initial={v("avatarUrl", review?.avatarUrl)} label="Photo ou logo (facultatif)" hint="Sans photo, l’initiale du nom s’affiche." />
        <div className="adm-stack">
          <div className="adm-field">
            <label htmlFor="rv-status">Affichage</label>
            <select id="rv-status" name="status" className="adm-select" defaultValue={v("status", review?.status ?? "published")}>
              <option value="published">Publié sur le site</option>
              <option value="draft">Masqué</option>
            </select>
          </div>
          <div className="adm-field">
            <label htmlFor="rv-order">Ordre d’affichage</label>
            <input id="rv-order" name="sortOrder" type="number" min={0} className="adm-input" defaultValue={v("sortOrder", review?.sortOrder ?? 0)} />
            <small>Le plus petit en premier ; à égalité, le plus récent d’abord.</small>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
          {review ? null : Icons.plus}
          {pending ? "Enregistrement…" : review ? "Enregistrer" : "Ajouter l’avis"}
        </button>
        {review && (
          <Link href="/admin/avis" className="adm-btn adm-btn--ghost">
            Annuler
          </Link>
        )}
      </div>
    </form>
  );
}

/** note globale, nombre d'avis, identifiant de la fiche Google */
export function ReviewSettingsForm({ rating, total, placeId }: { rating: number; total: number; placeId: string }) {
  const [state, action, pending] = useActionState(saveReviewSettings, undefined);
  const f = state?.fields;
  return (
    <form action={action} className="adm-card adm-stack">
      <h2>Fiche Google</h2>
      <p className="adm-card-text">Affichés au-dessus des avis : « Avis Google · 4,8 ★ · 28 avis ». À mettre à jour quand ils changent sur Google.</p>
      {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
      {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
      <div className="adm-row">
        <div className="adm-field">
          <label htmlFor="rs-rating">Note globale</label>
          <input id="rs-rating" name="rating" className="adm-input" inputMode="decimal" placeholder="4,8" defaultValue={f?.rating ?? (rating ? String(rating).replace(".", ",") : "")} />
        </div>
        <div className="adm-field">
          <label htmlFor="rs-total">Nombre d’avis</label>
          <input id="rs-total" name="total" className="adm-input" inputMode="numeric" placeholder="28" defaultValue={f?.total ?? (total ? String(total) : "")} />
        </div>
      </div>
      <div className="adm-field">
        <label htmlFor="rs-place">Identifiant de la fiche (Place ID)</label>
        <input id="rs-place" name="placeId" className="adm-input" defaultValue={f?.placeId ?? placeId} />
        <small>Sert aux boutons « Voir tous nos avis » et « Laisser un avis ».</small>
      </div>
      <div>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
