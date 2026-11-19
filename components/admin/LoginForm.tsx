"use client";

import { useActionState } from "react";
import { login } from "@/lib/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      {state?.error && <p className="adm-alert adm-alert--error">{state.error}</p>}
      <div className="adm-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="adm-input" autoComplete="username" defaultValue={state?.fields?.email} required autoFocus />
      </div>
      <div className="adm-field">
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" className="adm-input" autoComplete="current-password" required />
      </div>
      <div className="adm-login-row">
        <label className="adm-check">
          <input type="checkbox" name="remember" />
          <span aria-hidden="true" />
          Se souvenir de moi
        </label>
      </div>
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
