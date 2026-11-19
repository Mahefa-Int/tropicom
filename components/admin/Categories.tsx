"use client";

import { useActionState, useState, useTransition } from "react";
import { createCategory, createSuggestedCategories, deleteCategory, quickCreateCategory, renameCategory } from "@/lib/admin/actions";
import { Icons } from "./icons";

/** formulaire « ajouter une catégorie » (page Catégories) */
export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  return (
    <form action={action} className="adm-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2>Ajouter une catégorie</h2>
      {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
      {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <input key={state?.ok} name="name" className="adm-input" placeholder="ex. Conseils, Actualités, Études de cas…" defaultValue={state?.fields?.name} maxLength={80} required />
        <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
          {Icons.plus}
          {pending ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

/** une ligne du tableau : renommer sur place, supprimer */
export function CategoryRow({ id, name, slug, count }: { id: number; name: string; slug: string; count: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const r = await renameCategory(id, value);
      if (r.error) setError(r.error);
      else {
        setError("");
        setEditing(false);
      }
    });

  return (
    <tr>
      <td>
        {editing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className="adm-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") {
                  setEditing(false);
                  setValue(name);
                }
              }}
              autoFocus
              maxLength={80}
              style={{ maxWidth: 280, padding: "6px 10px" }}
            />
            <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={save} disabled={pending}>
              Enregistrer
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--sm"
              onClick={() => {
                setEditing(false);
                setValue(name);
                setError("");
              }}
            >
              Annuler
            </button>
          </div>
        ) : (
          <span className="adm-strong">{name}</span>
        )}
        {error && <span className="adm-sub" style={{ color: "#ff9b9e" }}>{error}</span>}
      </td>
      <td className="adm-sub">/blog/categorie/{slug}</td>
      <td>
        <span className="adm-badge adm-badge--teal">
          {count} article{count > 1 ? "s" : ""}
        </span>
      </td>
      <td>
        {!editing && (
          <div className="adm-actions">
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(true)}>
              {Icons.edit}
              Renommer
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--sm"
              disabled={pending}
              onClick={() => {
                const msg = count
                  ? `Supprimer « ${name} » ? Ses ${count} article(s) resteront, sans catégorie.`
                  : `Supprimer la catégorie « ${name} » ?`;
                if (window.confirm(msg)) start(() => deleteCategory(id));
              }}
            >
              {Icons.trash}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export function SuggestedCategoriesButton() {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="adm-btn adm-btn--sm" disabled={pending} onClick={() => start(() => createSuggestedCategories())}>
      {pending ? "Ajout…" : "Ajouter les catégories suggérées"}
    </button>
  );
}

/** choix de la catégorie dans le formulaire d'un article, avec création rapide */
export function CategorySelect({ categories, initial }: { categories: { id: number; name: string }[]; initial: number | null }) {
  const [list, setList] = useState(categories);
  const [value, setValue] = useState(initial ? String(initial) : "");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      const r = await quickCreateCategory(name);
      if ("error" in r) return setError(r.error);
      setList((l) => (l.some((c) => c.id === r.id) ? l : [...l, r].sort((a, b) => a.name.localeCompare(b.name, "fr"))));
      setValue(String(r.id));
      setName("");
      setError("");
      setAdding(false);
    });

  return (
    <div className="adm-field">
      <label htmlFor="categoryId">Catégorie</label>
      <select id="categoryId" name="categoryId" className="adm-select" value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">Sans catégorie</option>
        {list.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {adding ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="adm-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              // Entrée : ajouter la catégorie (sans envoyer le formulaire de l'article)
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Nouvelle catégorie"
            autoFocus
            maxLength={80}
            style={{ padding: "7px 10px" }}
          />
          <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" style={{ height: 36 }} onClick={add} disabled={pending}>
            OK
          </button>
        </div>
      ) : (
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => setAdding(true)}>
          {Icons.plus}
          Nouvelle catégorie
        </button>
      )}
      {error && <small style={{ color: "#ff9b9e" }}>{error}</small>}
    </div>
  );
}
