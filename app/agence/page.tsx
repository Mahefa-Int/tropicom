import { redirect } from "next/navigation";

// « L'Agence » est un menu parent sans contenu propre : on ouvre sa première sous-page.
export default function AgencePage() {
  redirect("/agence/equipe");
}
