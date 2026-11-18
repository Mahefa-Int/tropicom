"use client";

import { useActionState } from "react";
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

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
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
          <input id="next" name="next" type="password" className="adm-input" autoComplete="new-password" required />
        </div>
        <div className="adm-field">
          <label htmlFor="confirm">Confirmer</label>
          <input id="confirm" name="confirm" type="password" className="adm-input" autoComplete="new-password" required />
        </div>
      </div>
      <small style={{ color: "var(--a-muted)" }}>10 caractères minimum, avec au moins une lettre et un chiffre. Les autres appareils seront déconnectés.</small>
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Enregistrement…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
