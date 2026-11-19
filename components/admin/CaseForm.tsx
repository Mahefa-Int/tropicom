"use client";

import { useActionState, useRef, useState } from "react";
import { saveCaseStudy } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/util";
import { emptyDetails, parseDetails, type CaseDetails } from "@/lib/cases";
import type { CaseStudy } from "@/lib/db/schema";
import ImageField from "./ImageField";

/**
 * Étude de cas : un bloc par section de la page publique (en-tête, photo, contexte, enjeu, réponse, visuels,
 * résultats, verbatim, fin de page). Tout le contenu détaillé part en JSON dans le champ caché « details ».
 */
type Other = { id: number; client: string | null; title: string; status: string };
type Keyed<T> = T & { _k: number };

const LINES = "Un retour à la ligne ici = un retour à la ligne sur ordinateur (ignoré sur mobile).";

function Card({ n, title, text, children }: { n?: string; title: string; text?: string; children: React.ReactNode }) {
  return (
    <section className="adm-card">
      <h2>
        {n && <span style={{ color: "var(--a-yellow)", marginRight: 8 }}>{n}</span>}
        {title}
      </h2>
      {text && <p className="adm-card-text">{text}</p>}
      <div className="adm-stack">{children}</div>
    </section>
  );
}

export default function CaseForm({ item, others, created }: { item?: CaseStudy; others: Other[]; created?: boolean }) {
  const [state, action, pending] = useActionState(saveCaseStudy, created ? { ok: "Réalisation créée." } : undefined);
  const [client, setClient] = useState(item?.client ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [touched, setTouched] = useState(!!item);

  // listes : chaque élément reçoit une clé stable (_k) pour que l'ordre puisse changer sans mélanger les images
  const k = useRef(0);
  const key = <T,>(a: T[]): Keyed<T>[] => a.map((x) => ({ ...x, _k: ++k.current }));
  const [d, setD] = useState(() => {
    const v = item ? parseDetails(item.details) : emptyDetails();
    return { ...v, meta: key(v.meta), levers: key(v.levers), gallery: key(v.gallery), results: key(v.results) };
  });
  type D = typeof d;
  const set = <K extends keyof D>(k2: K, v: D[K]) => setD((p) => ({ ...p, [k2]: v }));
  const sub = <K extends "hero" | "highlight" | "quote">(k2: K, f: keyof CaseDetails[K], v: string) =>
    setD((p) => ({ ...p, [k2]: { ...p[k2], [f]: v } }));
  const newItem = <T,>(x: T): Keyed<T> => ({ ...x, _k: ++k.current });

  /* ---------- petits champs ---------- */
  const Text = ({ label, value, onChange, ph, hint }: { label: string; value: string; onChange: (v: string) => void; ph?: string; hint?: string }) => (
    <div className="adm-field">
      <label>{label}</label>
      <input className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} />
      {hint && <small>{hint}</small>}
    </div>
  );
  const Area = ({ label, value, onChange, ph, rows = 3, hint = LINES }: { label: string; value: string; onChange: (v: string) => void; ph?: string; rows?: number; hint?: string }) => (
    <div className="adm-field">
      <label>{label}</label>
      <textarea className="adm-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} style={{ minHeight: rows * 26 + 20 }} />
      {hint && <small>{hint}</small>}
    </div>
  );

  /* ---------- listes (ajout, suppression, ordre) ---------- */
  function List<T extends object>({
    field,
    items,
    blank,
    add,
    render,
    max = 8,
  }: {
    field: "meta" | "levers" | "gallery" | "results";
    items: Keyed<T>[];
    blank: T;
    add: string;
    render: (it: Keyed<T>, upd: (patch: Partial<T>) => void, i: number) => React.ReactNode;
    max?: number;
  }) {
    const write = (next: Keyed<T>[]) => set(field, next as never);
    const move = (i: number, dir: -1 | 1) => {
      const n = [...items];
      [n[i], n[i + dir]] = [n[i + dir], n[i]];
      write(n);
    };
    return (
      <div className="adm-rep">
        {items.map((it, i) => (
          <div className="adm-rep-item" key={it._k}>
            <div className="adm-rep-body">{render(it, (patch) => write(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>
            <div className="adm-rep-tools">
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre">↓</button>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => write(items.filter((_, j) => j !== i))} aria-label="Retirer">✕</button>
            </div>
          </div>
        ))}
        {items.length < max && (
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => write([...items, newItem(blank)])}>
            + {add}
          </button>
        )}
      </div>
    );
  }

  const finalSlug = slugify(slug || client);

  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <input type="hidden" name="details" value={JSON.stringify(d)} />
      <div className="adm-form-main">
        {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
        {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}

        <Card title="En-tête" text="Haut de la page : fil d’Ariane, grand titre et tableau d’informations à droite.">
          <div className="adm-field">
            <label htmlFor="client">Nom du client</label>
            <input
              id="client"
              name="client"
              className="adm-input adm-input--lg"
              value={client}
              onChange={(e) => {
                setClient(e.target.value);
                if (!touched) setSlug(slugify(e.target.value));
              }}
              placeholder="ex. Grand Hôtel Diego"
              required
            />
            <small>Affiché dans le fil d’Ariane et sur la carte « Projet suivant ».</small>
          </div>
          {Text({ label: "Titre · 1re ligne (en jaune)", value: d.titleLead, onChange: (v) => set("titleLead", v), ph: "ex. Grand Hôtel Diego :" })}
          {Area({ label: "Titre · suite (en blanc)", value: d.titleRest, onChange: (v) => set("titleRest", v), rows: 2, ph: "reprendre la main sur la\nréservation directe." })}
          <div className="adm-field">
            <label>Tableau d’informations</label>
            {List({
              field: "meta",
              items: d.meta,
              blank: { label: "", value: "" },
              add: "Ajouter une ligne",
              render: (m, upd) => (
                <div className="adm-row adm-row--tight">
                  <input className="adm-input" value={m.label} onChange={(e) => upd({ label: e.target.value })} placeholder="Intitulé (ex. Territoire)" />
                  <input className="adm-input" value={m.value} onChange={(e) => upd({ value: e.target.value })} placeholder="Valeur (ex. Antsiranana, Madagascar)" />
                </div>
              ),
            })}
          </div>
        </Card>

        <Card title="Photo principale" text="Grande photo sous le titre, avec sa légende (en bas à gauche) et un chiffre clé (en bas à droite).">
          <div style={{ maxWidth: 460 }}>
            <ImageField name="coverUrl" initial={item?.coverUrl} label="Photo" hint="Format paysage, 2800 × 1240 idéalement." />
          </div>
          {Text({ label: "Description de la photo (accessibilité)", value: d.hero.alt, onChange: (v) => sub("hero", "alt", v), ph: "ex. Façade de l’hôtel au coucher du soleil" })}
          {Text({ label: "Légende", value: d.hero.caption, onChange: (v) => sub("hero", "caption", v), ph: "ex. Photo · façade et piscine, golden hour" })}
          <div className="adm-row">
            {Text({ label: "Chiffre clé", value: d.hero.stat, onChange: (v) => sub("hero", "stat", v), ph: "ex. 8,8 %" })}
            {Text({ label: "Texte du chiffre", value: d.hero.statText, onChange: (v) => sub("hero", "statText", v), ph: "ex. d’engagement · vidéo du 23 août" })}
          </div>
          <small className="adm-hint">Laisser le chiffre vide pour masquer la carte.</small>
        </Card>

        <Card n="01" title="Contexte">
          {Area({ label: "Texte", value: d.context, onChange: (v) => set("context", v), rows: 3 })}
        </Card>

        <Card n="02" title="L’enjeu" text="Phrase forte, avec un trait jaune à gauche.">
          {Area({ label: "Texte", value: d.stake, onChange: (v) => set("stake", v), rows: 3 })}
        </Card>

        <Card n="03" title="Notre réponse">
          {Text({ label: "Début de la phrase (en blanc)", value: d.answerLead, onChange: (v) => set("answerLead", v), ph: "ex. Une même logique :" })}
          {Area({ label: "Suite de la phrase (en jaune)", value: d.answerHighlight, onChange: (v) => set("answerHighlight", v), rows: 2 })}
          <div className="adm-field">
            <label>Leviers (cartes numérotées automatiquement)</label>
            {List({
              field: "levers",
              items: d.levers,
              blank: { title: "", text: "" },
              add: "Ajouter un levier",
              render: (l, upd, i) => (
                <div className="adm-stack adm-stack--tight">
                  <input className="adm-input" value={l.title} onChange={(e) => upd({ title: e.target.value })} placeholder={`Levier 0${i + 1} · titre`} />
                  <textarea className="adm-textarea" rows={2} value={l.text} onChange={(e) => upd({ text: e.target.value })} placeholder="Description (retour à la ligne = retour à la ligne sur ordinateur)" style={{ minHeight: 72 }} />
                </div>
              ),
            })}
          </div>
        </Card>

        <Card title="Visuels" text="Grandes images pleine largeur après « Notre réponse », dans l’ordre de la liste. Leur hauteur suit leur format.">
          {List({
            field: "gallery",
            items: d.gallery,
            blank: { src: "", alt: "" },
            add: "Ajouter un visuel",
            max: 12,
            render: (g, upd) => (
              <div className="adm-row adm-row--media">
                <ImageField initial={g.src} label="Image" hint="" onChange={(url, w, h) => upd({ src: url, w, h })} />
                <div className="adm-field">
                  <label>Description (accessibilité)</label>
                  <textarea className="adm-textarea" rows={3} value={g.alt} onChange={(e) => upd({ alt: e.target.value })} placeholder="ex. Publications réseaux sociaux et kakémonos" style={{ minHeight: 90 }} />
                </div>
              </div>
            ),
          })}
        </Card>

        <Card n="04" title="Résultats">
          <div className="adm-row">
            {Text({ label: "Titre", value: d.resultsTitle, onChange: (v) => set("resultsTitle", v) })}
            {Text({ label: "Note à droite du titre", value: d.resultsNote, onChange: (v) => set("resultsNote", v), ph: "ex. Réseaux sociaux · août 2026" })}
          </div>
          <div className="adm-field">
            <label>Chiffres (3 idéalement ; le premier est sur fond gris)</label>
            {List({
              field: "results",
              items: d.results,
              blank: { value: "", label: "", note: "" },
              add: "Ajouter un chiffre",
              max: 6,
              render: (r, upd) => (
                <div className="adm-row adm-row--3">
                  <input className="adm-input" value={r.value} onChange={(e) => upd({ value: e.target.value })} placeholder="Chiffre (ex. 635)" />
                  <input className="adm-input" value={r.label} onChange={(e) => upd({ label: e.target.value })} placeholder="Libellé (ex. clics vers le site)" />
                  <input className="adm-input" value={r.note} onChange={(e) => upd({ note: e.target.value })} placeholder="Précision (ex. contre 3,6 %…)" />
                </div>
              ),
            })}
          </div>
          <div className="adm-row">
            {Text({ label: "Bandeau · partie en gras", value: d.highlight.strong, onChange: (v) => sub("highlight", "strong", v), ph: "ex. La vidéo piscine atteint 8,8 % d’engagement" })}
            {Text({ label: "Bandeau · suite", value: d.highlight.text, onChange: (v) => sub("highlight", "text", v), ph: "ex. : les formats courts font la différence." })}
          </div>
          <small className="adm-hint">Laisser le bandeau vide pour le masquer.</small>
        </Card>

        <Card n="05" title="Verbatim" text="Laisser la citation vide pour masquer la section (et son entrée dans le sommaire).">
          {Area({ label: "Citation (sans guillemets)", value: d.quote.text, onChange: (v) => sub("quote", "text", v), rows: 3, hint: "" })}
          <div className="adm-row">
            {Text({ label: "Nom", value: d.quote.name, onChange: (v) => sub("quote", "name", v) })}
            {Text({ label: "Fonction · structure", value: d.quote.role, onChange: (v) => sub("quote", "role", v), ph: "ex. Directeur · Grand Hôtel Diego" })}
          </div>
          <div style={{ maxWidth: 220 }}>
            <ImageField initial={d.quote.avatar} label="Photo (portrait)" hint="Carrée de préférence." onChange={(url) => sub("quote", "avatar", url)} />
          </div>
        </Card>

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
          {item && (
            <a href={`/realisations/${item.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn--ghost" style={{ width: "100%", marginTop: 8 }}>
              Voir la page{item.status !== "published" ? " (aperçu)" : ""}
            </a>
          )}
          <div className="adm-field" style={{ marginTop: 14 }}>
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
            <small>/realisations/{finalSlug || "…"}</small>
          </div>
        </section>


        <section className="adm-card">
          <h2>Projet suivant</h2>
          <div className="adm-field">
            <label htmlFor="nextId">Réalisation affichée en bas de page</label>
            <select id="nextId" className="adm-select" value={d.nextId ?? ""} onChange={(e) => set("nextId", Number(e.target.value) || null)}>
              <option value="">Automatique (la suivante dans l’ordre)</option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {(o.client || o.title) + (o.status !== "published" ? " (brouillon)" : "")}
                </option>
              ))}
            </select>
            <small>La carte reprend automatiquement la photo principale, le chiffre clé, le titre et la ligne « Expertises » de cette réalisation. Seules les réalisations publiées s’affichent. S’il n’y en a aucune autre, l’appel à l’action prend toute la largeur.</small>
          </div>
        </section>

        <section className="adm-card">
          <h2>Classement</h2>
          <div className="adm-stack">
            <div className="adm-field">
              <label htmlFor="sector">Secteur</label>
              <input id="sector" name="sector" className="adm-input" list="adm-sectors" defaultValue={item?.sector ?? ""} />
              <datalist id="adm-sectors">
                {["Hôtel", "Lodge", "Tour-opérateur", "Restaurant", "Salon / événement", "Destination"].map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="adm-field">
              <label htmlFor="location">Lieu</label>
              <input id="location" name="location" className="adm-input" defaultValue={item?.location ?? ""} placeholder="ex. Antsiranana, Madagascar" />
            </div>
            <div className="adm-field">
              <label htmlFor="sortOrder">Ordre d&apos;affichage</label>
              <input id="sortOrder" name="sortOrder" type="number" className="adm-input" defaultValue={item?.sortOrder ?? 0} />
              <small>Les plus petits nombres s&apos;affichent en premier.</small>
            </div>
          </div>
        </section>

        <section className="adm-card">
          <h2>Référencement</h2>
          <div className="adm-stack">
            {Text({ label: "Titre pour Google", value: d.seoTitle, onChange: (v) => set("seoTitle", v), hint: "Vide : le titre de la page." })}
            {Area({ label: "Description pour Google", value: d.seoDescription, onChange: (v) => set("seoDescription", v), rows: 3, hint: `${d.seoDescription.length} / 300` })}
          </div>
        </section>
      </aside>
    </form>
  );
}
