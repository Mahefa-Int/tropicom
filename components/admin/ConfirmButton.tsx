"use client";

import { useTransition } from "react";

/** bouton qui demande confirmation puis lance une action serveur (suppression, etc.) */
export default function ConfirmButton({
  action,
  confirm = "Confirmer la suppression ?",
  className = "adm-btn adm-btn--danger adm-btn--sm",
  children,
}: {
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
