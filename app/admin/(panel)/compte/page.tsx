import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import { PasswordForm, ProfileForm } from "@/components/admin/AccountForms";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <>
      <PageHead title="Mon compte" text="Compte administrateur du back-office." />
      <div className="adm-grid adm-grid--2">
        <ProfileForm name={me.name} email={me.email} />
        <PasswordForm />
      </div>
    </>
  );
}
