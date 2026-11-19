import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/dal";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  // déjà connecté : direction le tableau de bord
  if (await getAdminUser()) redirect("/admin");
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        {/* le logo ramène au site public */}
        <a href="/" className="adm-login-logo" title="Retour au site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-tropicom.svg" alt="Tropi'Com — retour au site" />
        </a>
        <h1>Back-office</h1>
        <p>Connectez-vous pour gérer le contenu du site.</p>
        <LoginForm />
      </div>
    </div>
  );
}
