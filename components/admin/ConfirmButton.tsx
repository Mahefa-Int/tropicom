"use client";

import { useTransition } from "react";

/** bouton qui demande confirmation puis lance une action serveur (suppression, etc.) */
export default function ConfirmButton({
  action,
  confirm = "Confirmer la suppression ?",
  className = "adm-btn adm-btn--danger adm-btn--sm",
  label,
  children,
}: {
  /** texte de l'info-bulle et du lecteur d'écran (bouton icône seule) */
  label?: string;
  action: () => Promise<unknown>;
  confirm?: string | false;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      data-tip={label}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {children}
    </button>
  );
}
