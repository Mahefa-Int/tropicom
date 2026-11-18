"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaAlt } from "@/lib/admin/actions";
import { uploadImage } from "./upload";
import { Icons } from "./icons";

type Item = { id: number; url: string; originalName: string | null; alt: string | null; width: number | null; height: number | null; size: number };

/** médiathèque : envoi multiple, texte alternatif, copie de l'adresse, suppression */
export default function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [, start] = useTransition();

  const send = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(files.length);
    for (const f of Array.from(files)) {
      const r = await uploadImage(f);
      if ("error" in r) setError(`${f.name} : ${r.error}`);
      setBusy((n) => n - 1);
    }
    router.refresh();
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => input.current?.click()} disabled={busy > 0}>
          {Icons.upload}
          {busy ? `Envoi… (${busy})` : "Ajouter des images"}
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => send(e.target.files)} />
        {error && <span style={{ color: "#ff9b9e" }}>{error}</span>}
      </div>
      {items.length ? (
        <div className="adm-media">
          {items.map((m) => (
            <figure key={m.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ""} loading="lazy" />
              <figcaption>
                <span title={m.originalName ?? ""} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.originalName ?? m.url}
                </span>
                <span>
                  {m.width} × {m.height} · {Math.round(m.size / 1024)} Ko
                </span>
                <input
                  className="adm-input"
                  placeholder="Texte alternatif"
                  defaultValue={m.alt ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (m.alt ?? "")) start(() => updateMediaAlt(m.id, e.target.value));
                  }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="adm-btn adm-btn--sm" onClick={() => navigator.clipboard.writeText(location.origin + m.url)}>
                    Copier l&apos;adresse
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn--danger adm-btn--sm"
                    aria-label="Supprimer"
                    onClick={() => {
                      if (window.confirm("Supprimer cette image ? Elle disparaîtra aussi des contenus qui l'utilisent.")) start(() => deleteMedia(m.id));
                    }}
                  >
                    {Icons.trash}
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="adm-empty">
          <b>Médiathèque vide</b>
          Les images envoyées (couvertures, illustrations d&apos;articles) apparaissent ici.
        </div>
      )}
    </>
  );
}
