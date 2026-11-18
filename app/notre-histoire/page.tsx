import { redirect } from "next/navigation";

// ancienne adresse : la page est maintenant sous « L'Agence »
export default function OldNotreHistoire() {
  redirect("/agence/notre-histoire");
}
