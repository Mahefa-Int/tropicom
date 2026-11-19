"use client";

import { useEffect, useRef, useState } from "react";
import { listMedia, type MediaPick } from "@/lib/admin/actions";

/**
 * « Choisir dans la Médiathèque » : fenêtre avec les images déjà envoyées, recherche par nom ;
 * un clic choisit l'image (évite de renvoyer la même image et de créer des doublons).
 */
export default function MediaPicker({ onPick, onClose }: { onPick: (m: MediaPick) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaPick[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    listMedia().then(setItems);
  }, []);

  const shown = (items ?? []).filter((m) => (m.name + " " + m.alt).toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <dialog
      ref={ref}
      className="adm-modal adm-picker"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
      aria-label="Choisir dans la Médiathèque"
    >
      <div className="adm-picker-head">
        <h2>Médiathèque</h2>
        <input className="adm-input" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} />
        <button type="button" className="adm-modal-x" onClick={() => ref.current?.close()} aria-label="Fermer">
          ✕
        </button>
      </div>
      <div className="adm-picker-grid">
        {items === null && <p className="adm-picker-empty">Chargement…</p>}
        {items !== null && !shown.length && <p className="adm-picker-empty">{items.length ? "Aucune image ne correspond." : "Médiathèque vide."}</p>}
        {shown.map((m) => (
          <button
            key={m.id}
            type="button"
            className="adm-tile"
            title={m.name}
            onClick={() => {
              onPick(m);
              ref.current?.close();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} />
          </button>
        ))}
      </div>
    </dialog>
  );
}
