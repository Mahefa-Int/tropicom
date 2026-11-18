import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import CaseForm from "@/components/admin/CaseForm";

export const metadata = { title: "Nouvelle réalisation" };

export default async function NewCase() {
  await requireUser();
  return (
    <>
      <PageHead title="Nouvelle réalisation" crumb={{ href: "/admin/realisations", label: "Réalisations" }} />
      <CaseForm />
    </>
  );
}
