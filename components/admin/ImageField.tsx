"use client";

import { useRef, useState } from "react";
import { Icons } from "./icons";
import { uploadImage } from "./upload";
import MediaPicker from "./MediaPicker";

/** image de couverture : clic ou glisser-déposer, envoi immédiat, l'adresse est gardée dans un champ caché */
export default function ImageField({
  name,
  initial,
  label = "Image de couverture",
  hint = "À optimiser ensuite depuis la Médiathèque (webp, poids réduit).",
  onChange,
}: {
  name?: string;
  initial?: string | null;
  label?: string;
  hint?: string;
  /** appelé à chaque envoi / retrait (adresse, largeur, hauteur) */
  onChange?: (url: string, w?: number, h?: number) => void;
}) {
  const [url, setUrl] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const send = async (f?: File | null) => {
    if (!f) return;
    setBusy(true);
    setError("");
    const r = await uploadImage(f);
    setBusy(false);
    if ("url" in r) {
      setUrl(r.url);
      onChange?.(r.url, r.width, r.height);
    } else setError(r.error);
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
      <div className="adm-image-tools">
        {url && (
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Envoi…" : "Remplacer"}
          </button>
        )}
        <button type="button" className="adm-btn adm-btn--sm" onClick={() => setPicking(true)}>
          Choisir dans la Médiathèque
        </button>
        {url && (
          
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => {
              setUrl("");
              onChange?.("");
            }}>
            Retirer
          </button>
        )}
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(m) => {
            setUrl(m.url);
            setError("");
            onChange?.(m.url, m.width ?? undefined, m.height ?? undefined);
          }}
        />
      )}
      {error && <small style={{ color: "#ff9b9e" }}>{error}</small>}
      {hint && <small>{hint}</small>}
      {name && <input type="hidden" name={name} value={url} />}
    </div>
  );
}
