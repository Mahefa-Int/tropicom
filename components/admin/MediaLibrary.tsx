"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { deleteMedia, optimizeMedia, updateMediaAlt, updateMediaDescription } from "@/lib/admin/actions";
import { Icons } from "./icons";

type Item = {
  id: number;
  url: string;
  originalName: string | null;
  alt: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  size: number;
  mime: string;
  originalSize: number | null;
  optimizedAt: Date | null;
};

const ko = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);
const FORMAT: Record<string, string> = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WEBP", "image/gif": "GIF" };
const needsOptim = (m: Item) => !m.optimizedAt && m.mime !== "image/gif";

/** état d'optimisation : bouton « Optimiser », ou gain obtenu */
function Optimize({ m, alt }: { m: Item; alt: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  if (m.optimizedAt) {
    const gain = m.originalSize && m.originalSize > m.size ? Math.round((1 - m.size / m.originalSize) * 100) : 0;
    return (
      <span className="adm-optim">
        <span className="adm-status adm-status--pub">Optimisée</span>
        {gain > 0 && (
          <span>
            {ko(m.originalSize!)} → {ko(m.size)} <b>−{gain} %</b>
          </span>
        )}
      </span>
    );
  }
  if (m.mime === "image/gif") return <span className="adm-optim">GIF animé : gardé tel quel</span>;
  return (
    <span className="adm-optim">
      <button
        type="button"
        className="adm-btn adm-btn--primary adm-btn--sm adm-optim-btn"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const r = await optimizeMedia(m.id, alt);
            if ("error" in r) setError(r.error);
          })
        }
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z" />
        </svg>
        {pending ? "Optimisation…" : "Optimiser"}
      </button>
      <span>
        webp, poids réduit, sans perte visible
        {alt.trim() ? " ; renommée d’après le texte alternatif" : ""}
      </span>
      {error && <small style={{ color: "#ff9b9e" }}>{error}</small>}
    </span>
  );
}

/** fenêtre de détail : grand aperçu, informations, textes, actions */
function Detail({ m, onClose }: { m: Item; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [, start] = useTransition();
  const [alt, setAlt] = useState(m.alt ?? "");
  const fileName = m.url.split("/").pop() ?? m.url;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="adm-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close(); // clic sur le fond
      }}
      aria-label={fileName}
    >
      <div className="adm-modal-body">
        <div className="adm-modal-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt={m.alt ?? ""} />
        </div>
        <div className="adm-modal-side">
          <div className="adm-modal-head">
            <div style={{ minWidth: 0 }}>
              <h2 title={fileName}>{fileName}</h2>
              <p>
                {m.width} × {m.height} · {ko(m.size)} · {FORMAT[m.mime] ?? m.mime}
              </p>
            </div>
            <button type="button" className="adm-modal-x" onClick={() => ref.current?.close()} aria-label="Fermer">
              ✕
            </button>
          </div>

          <Optimize m={m} alt={alt} />

          <div className="adm-field">
            <label htmlFor="m-alt">Texte alternatif</label>
            <input
              id="m-alt"
              className="adm-input"
              placeholder="Ce que montre l'image (lecteurs d'écran, Google)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== (m.alt ?? "")) start(() => updateMediaAlt(m.id, e.target.value));
              }}
            />
          </div>
          <div className="adm-field">
            <label htmlFor="m-desc">Description</label>
            <textarea
              id="m-desc"
              className="adm-textarea"
              rows={4}
              placeholder="Contexte, crédit photo, usage…"
              defaultValue={m.description ?? ""}
              onBlur={(e) => {
                if (e.target.value.trim() !== (m.description ?? "")) start(() => updateMediaDescription(m.id, e.target.value));
              }}
            />
            <small>Enregistré automatiquement.</small>
          </div>

          <div className="adm-modal-actions">
            <a href={m.url} target="_blank" rel="noreferrer" className="adm-btn adm-btn--sm">
              Ouvrir
            </a>
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--sm"
              aria-label="Supprimer"
              data-tip="Supprimer"
              style={{ marginLeft: "auto" }}
              onClick={() => {
                if (window.confirm("Supprimer cette image ? Elle disparaîtra aussi des contenus qui l'utilisent.")) {
                  start(() => deleteMedia(m.id));
                  ref.current?.close();
                }
              }}
            >
              {Icons.trash}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/** médiathèque : grille d'images ; un clic ouvre le détail (optimisation, textes, ouverture, suppression) */
export default function MediaLibrary({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = items.find((m) => m.id === openId);

  if (!items.length)
    return (
      <div className="adm-empty">
        <b>Médiathèque vide</b>
        Les images envoyées (couvertures, illustrations d&apos;articles) apparaissent ici.
      </div>
    );

  return (
    <>
      <div className="adm-media">
        {items.map((m) => (
          <button key={m.id} type="button" className="adm-tile" onClick={() => setOpenId(m.id)} aria-label={`Ouvrir ${m.originalName ?? "l'image"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt ?? ""} loading="lazy" />
            {needsOptim(m) && <span className="adm-tile-flag">À optimiser · {ko(m.size)}</span>}
          </button>
        ))}
      </div>
      {open && <Detail key={open.id} m={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
