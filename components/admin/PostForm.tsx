"use client";

import { useActionState, useState } from "react";
import { savePost } from "@/lib/admin/actions";
import { slugify } from "@/lib/admin/util";
import type { Post } from "@/lib/db/schema";
import RichEditor from "./RichEditor";
import ImageField from "./ImageField";
import { CategorySelect } from "./Categories";

export default function PostForm({ post, created, categories }: { post?: Post; created?: boolean; categories: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(savePost, created ? { ok: "Article créé." } : undefined);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [seoDesc, setSeoDesc] = useState(post?.seoDescription ?? "");

  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <div className="adm-form-main">
        {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
        {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
        <div className="adm-field">
          <label htmlFor="title">Titre</label>
          <input
            id="title"
            name="title"
            className="adm-input adm-input--lg"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Titre de l'article"
            required
          />
        </div>
        <div className="adm-field">
          <label htmlFor="excerpt">Chapô</label>
          <textarea id="excerpt" name="excerpt" className="adm-textarea" style={{ minHeight: 80 }} defaultValue={post?.excerpt ?? ""} placeholder="Résumé affiché dans la liste des articles" />
        </div>
        <div className="adm-field">
          <label>Contenu</label>
          <RichEditor name="content" initial={post?.content ?? ""} />
        </div>
        <section className="adm-card">
          <h2>Référencement (Google)</h2>
          <div className="adm-field" style={{ marginBottom: 12 }}>
            <label htmlFor="seoTitle">Titre pour Google</label>
            <input id="seoTitle" name="seoTitle" className="adm-input" defaultValue={post?.seoTitle ?? ""} placeholder={title || "Par défaut : le titre de l'article"} />
          </div>
          <div className="adm-field">
            <label htmlFor="seoDescription">Description pour Google</label>
            <textarea id="seoDescription" name="seoDescription" className="adm-textarea" style={{ minHeight: 70 }} maxLength={300} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
            <small>{seoDesc.length} / 160 caractères conseillés</small>
          </div>
        </section>
      </div>

      <aside className="adm-form-side">
        <section className="adm-card">
          <h2>Publication</h2>
          <div className="adm-seg" style={{ marginBottom: 14 }}>
            <label>
              <input type="radio" name="status" value="draft" defaultChecked={post?.status !== "published"} />
              <span>Brouillon</span>
            </label>
            <label>
              <input type="radio" name="status" value="published" defaultChecked={post?.status === "published"} />
              <span className="is-pub">Publié</span>
            </label>
          </div>
          <button type="submit" className="adm-btn adm-btn--primary" style={{ width: "100%" }} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </section>
        <section className="adm-card adm-form-side" style={{ position: "static" }}>
          <ImageField name="coverUrl" initial={post?.coverUrl} />
          <CategorySelect categories={categories} initial={post?.categoryId ?? null} />
          <div className="adm-field">
            <label htmlFor="slug">Adresse</label>
            <input
              id="slug"
              name="slug"
              className="adm-input"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
            <small>/blog/{slugify(slug || title) || "…"}</small>
          </div>
        </section>
      </aside>
    </form>
  );
}
