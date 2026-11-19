"use client";

import { useActionState, useState } from "react";
import { changePassword, updateAccount } from "@/lib/admin/actions";

function Alerts({ state }: { state: { error?: string; ok?: string } | undefined }) {
  return (
    <>
      {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
      {state?.ok && <p className="adm-alert adm-alert--ok">{state.ok}</p>}
    </>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateAccount, undefined);
  return (
    <form action={action} className="adm-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2>Profil</h2>
      <Alerts state={state} />
      <div className="adm-field">
        <label htmlFor="name">Nom affiché</label>
        <input id="name" name="name" className="adm-input" defaultValue={name} required />
      </div>
      <div className="adm-field">
        <label htmlFor="email">E-mail de connexion</label>
        <input id="email" name="email" type="email" className="adm-input" defaultValue={email} required />
      </div>
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

/** mot de passe aléatoire (générateur cryptographique du navigateur) : 16 caractères, lettres, chiffres et symboles */
function generatePassword(length = 16) {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const symbols = "!@#$%&*-_=+?";
  const all = lower + upper + digits + symbols;
  const rnd = (max: number) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  };
  // au moins un caractère de chaque famille, puis le reste au hasard, le tout mélangé
  const chars = [lower, upper, digits, symbols].map((set) => set[rnd(set.length)]);
  while (chars.length < length) chars.push(all[rnd(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const IconKey = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10a6 6 0 0 1 10.2-4.3M16 10a6 6 0 0 1-10.2 4.3" />
    <path d="M14.5 2.5v3.3h-3.3M5.5 17.5v-3.3h3.3" />
  </svg>
);
const IconEye = (open: boolean) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z" />
    <circle cx="10" cy="10" r="2.6" />
    {!open && <path d="M3 17 17 3" />}
  </svg>
);

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState("");

  const generate = async () => {
    const pw = generatePassword();
    setNext(pw);
    setConfirm(pw);
    setVisible(true);
    try {
      await navigator.clipboard.writeText(pw);
      setNote("Mot de passe généré et copié : gardez-le dans votre gestionnaire de mots de passe.");
    } catch {
      setNote("Mot de passe généré : notez-le avant d’enregistrer.");
    }
  };

  return (
    <form action={action} className="adm-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2>Mot de passe</h2>
      <Alerts state={state} />
      <div className="adm-field">
        <label htmlFor="current">Mot de passe actuel</label>
        <input id="current" name="current" type="password" className="adm-input" autoComplete="current-password" required />
      </div>
      <div className="adm-row">
        <div className="adm-field">
          <label htmlFor="next">Nouveau</label>
          <div className="adm-pw">
            <input
              id="next"
              name="next"
              type={visible ? "text" : "password"}
              className="adm-input"
              autoComplete="new-password"
              value={next}
              onChange={(e) => {
                setNext(e.target.value);
                setNote("");
              }}
              required
            />
            <div className="adm-pw-tools">
              <button type="button" className="adm-pw-btn" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Masquer" : "Afficher"} data-tip={visible ? "Masquer" : "Afficher"}>
                {IconEye(visible)}
              </button>
              <button type="button" className="adm-pw-btn" onClick={generate} aria-label="Générer un mot de passe" data-tip="Générer">
                {IconKey}
              </button>
            </div>
          </div>
        </div>
        <div className="adm-field">
          <label htmlFor="confirm">Confirmer</label>
          <input
            id="confirm"
            name="confirm"
            type={visible ? "text" : "password"}
            className="adm-input"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      </div>
      {note && <small style={{ color: "#6fd184" }}>{note}</small>}
      <small style={{ color: "var(--a-muted)" }}>10 caractères minimum, avec au moins une lettre et un chiffre. Les autres appareils seront déconnectés.</small>
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Enregistrement…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
