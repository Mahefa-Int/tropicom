"use client";

import { useRef, useState } from "react";
import { Icons } from "./icons";
import { uploadImage } from "./upload";

/** image de couverture : clic ou glisser-déposer, envoi immédiat, l'adresse est gardée dans un champ caché */
export default function ImageField({ name, initial, label = "Image de couverture" }: { name: string; initial?: string | null; label?: string }) {
  const [url, setUrl] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const send = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    setError("");
    const r = await uploadImage(f);
    setBusy(false);
    if ("url" in r) setUrl(r.url);
    else setError(r.error);
  };

  return (
    <div className="adm-field">
      <label>{label}</label>
      <div
        className={"adm-image" + (drag ? " is-drag" : "")}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          send(e.dataTransfer.files?.[0]);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt="" />}
        {!url && (
          <span>
            {Icons.upload}
            <br />
            {busy ? "Envoi…" : "Cliquer ou déposer une image"}
          </span>
        )}
        <input ref={input} type="file" accept="image/*" onChange={(e) => send(e.target.files?.[0])} />
      </div>
      {url && (
        <div className="adm-image-tools">
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Envoi…" : "Remplacer"}
          </button>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setUrl("")}>
            Retirer
          </button>
        </div>
      )}
      {error && <small style={{ color: "#ff9b9e" }}>{error}</small>}
      <small>Converti en webp automatiquement (2000 px max).</small>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
