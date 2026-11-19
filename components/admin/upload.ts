/** envoi d'une image vers /admin/api/upload (conversion webp côté serveur) */
export async function uploadImage(file: File): Promise<{ url: string; id: number; width: number; height: number } | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  try {
    const res = await fetch("/admin/api/upload", { method: "POST", body });
    const json = await res.json();
    return res.ok ? json : { error: json.error ?? "Échec de l'envoi." };
  } catch {
    return { error: "Échec de l'envoi (connexion)." };
  }
}
