"use client";

import { useActionState, useState } from "react";
import { saveCaseStudy } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/util";
import type { CaseStudy } from "@/lib/db/schema";
import ImageField from "./ImageField";

/** étude de cas : en trois temps, comme sur la page Réalisations (Situation → Réponse → Résultats) */
export default function CaseForm({ item, created }: { item?: CaseStudy; created?: boolean }) {
  const [state, action, pending] = useActionState(saveCaseStudy, created ? { ok: "Réalisation créée." } : undefined);
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [touched, setTouched] = useState(!!item);

  const step = (n: string, label: string, name: "situation" | "response" | "results", hint: string) => (
    <section className="adm-card">
      <h2>
        <span style={{ color: "var(--a-yellow)", marginRight: 8 }}>{n}</span>
        {label}
      </h2>
      <textarea name={name} className="adm-textarea" defaultValue={item?.[name] ?? ""} placeholder={hint} style={{ minHeight: 130 }} />
    </section>
  );

  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <div className="adm-form-main">
        {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
        {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
        <div className="adm-field">
          <label htmlFor="title">Titre de l&apos;étude de cas</label>
          <input
            id="title"
            name="title"
            className="adm-input adm-input--lg"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!touched) setSlug(slugify(e.target.value));
            }}
            placeholder="ex. Echoes of the Forest : +40 % de réservations directes"
            required
          />
        </div>
        <div className="adm-row">
          <div className="adm-field">
            <label htmlFor="client">Client</label>
            <input id="client" name="client" className="adm-input" defaultValue={item?.client ?? ""} />
          </div>
          <div className="adm-field">
            <label htmlFor="sector">Secteur</label>
            <input id="sector" name="sector" className="adm-input" list="adm-sectors" defaultValue={item?.sector ?? ""} />
            <datalist id="adm-sectors">
              {["Hôtel", "Lodge", "Tour-opérateur", "Restaurant", "Salon / événement", "Destination"].map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>
        {step("01", "Situation", "situation", "Le point de départ : contexte, problème, objectifs du client.")}
        {step("02", "Réponse", "response", "Ce que nous avons fait : pôles mobilisés, actions, livrables.")}
        {step("03", "Résultats", "results", "Ce que ça a produit : chiffres, effets mesurés, témoignage.")}
      </div>

      <aside className="adm-form-side">
        <section className="adm-card">
          <h2>Publication</h2>
          <div className="adm-seg" style={{ marginBottom: 14 }}>
            <label>
              <input type="radio" name="status" value="draft" defaultChecked={item?.status !== "published"} />
              <span>Brouillon</span>
            </label>
            <label>
              <input type="radio" name="status" value="published" defaultChecked={item?.status === "published"} />
              <span className="is-pub">Publié</span>
            </label>
          </div>
          <button type="submit" className="adm-btn adm-btn--primary" style={{ width: "100%" }} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </section>
        <section className="adm-card adm-form-side" style={{ position: "static" }}>
          <ImageField name="coverUrl" initial={item?.coverUrl} label="Visuel principal" />
          <div className="adm-field">
            <label htmlFor="location">Lieu</label>
            <input id="location" name="location" className="adm-input" defaultValue={item?.location ?? ""} placeholder="ex. Nosy Be, Madagascar" />
          </div>
          <div className="adm-field">
            <label htmlFor="sortOrder">Ordre d&apos;affichage</label>
            <input id="sortOrder" name="sortOrder" type="number" className="adm-input" defaultValue={item?.sortOrder ?? 0} />
            <small>Les plus petits nombres s&apos;affichent en premier.</small>
          </div>
          <div className="adm-field">
            <label htmlFor="slug">Adresse</label>
            <input
              id="slug"
              name="slug"
              className="adm-input"
              value={slug}
              onChange={(e) => {
                setTouched(true);
                setSlug(e.target.value);
              }}
            />
            <small>/realisations/{slugify(slug || title) || "…"}</small>
          </div>
        </section>
      </aside>
    </form>
  );
}
