import { requireUser } from "@/lib/admin/dal";
import { PageHead } from "@/components/admin/ui";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Nouvel article" };

export default async function NewPost() {
  await requireUser();
  return (
    <>
      <PageHead title="Nouvel article" crumb={{ href: "/admin/articles", label: "Articles" }} />
      <PostForm />
    </>
  );
}
