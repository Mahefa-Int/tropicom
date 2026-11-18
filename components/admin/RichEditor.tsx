"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { uploadImage } from "./upload";

/**
 * Éditeur de texte riche (Tiptap) : titres, gras, italique, listes, citation, liens, images (envoyées dans la médiathèque).
 * Le contenu HTML est recopié dans un champ caché « name » pour être envoyé avec le formulaire.
 */
export default function RichEditor({ name, initial }: { name: string; initial: string }) {
  const [html, setHtml] = useState(initial);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
      Image,
      Placeholder.configure({ placeholder: "Écrivez votre article…" }),
    ],
    content: initial,
    editorProps: { attributes: { class: "adm-prose" } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  const run = (fn: () => void) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    fn();
  };
  const c = () => editor!.chain().focus();
  const B = ({ on, label, title, onClick }: { on?: boolean; label: React.ReactNode; title: string; onClick: () => void }) => (
    <button type="button" className={on ? "is-on" : undefined} title={title} aria-label={title} onMouseDown={run(onClick)}>
      {label}
    </button>
  );

  return (
    <div className="adm-editor">
      {editor && s && (
        <div className="adm-toolbar">
          <B on={s.h2} label="H2" title="Titre" onClick={() => c().toggleHeading({ level: 2 }).run()} />
          <B on={s.h3} label="H3" title="Sous-titre" onClick={() => c().toggleHeading({ level: 3 }).run()} />
          <i />
          <B on={s.bold} label={<b>G</b>} title="Gras" onClick={() => c().toggleBold().run()} />
          <B on={s.italic} label={<em>I</em>} title="Italique" onClick={() => c().toggleItalic().run()} />
          <B on={s.underline} label={<u>S</u>} title="Souligné" onClick={() => c().toggleUnderline().run()} />
          <i />
          <B on={s.bullet} label="• Liste" title="Liste à puces" onClick={() => c().toggleBulletList().run()} />
          <B on={s.ordered} label="1. Liste" title="Liste numérotée" onClick={() => c().toggleOrderedList().run()} />
          <B on={s.quote} label="❝" title="Citation" onClick={() => c().toggleBlockquote().run()} />
          <i />
          <B
            on={s.link}
            label="Lien"
            title="Lien"
            onClick={() => {
              const prev = editor.getAttributes("link").href as string | undefined;
              const url = window.prompt("Adresse du lien (vide pour retirer)", prev ?? "https://");
              if (url === null) return;
              if (url === "") c().extendMarkRange("link").unsetLink().run();
              else c().extendMarkRange("link").setLink({ href: url }).run();
            }}
          />
          <B
            label="Image"
            title="Insérer une image"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = async () => {
                const f = input.files?.[0];
                if (!f) return;
                const r = await uploadImage(f);
                if ("url" in r) c().setImage({ src: r.url, alt: "" }).run();
                else window.alert(r.error);
              };
              input.click();
            }}
          />
          <i />
          <B label="↶" title="Annuler" onClick={() => c().undo().run()} />
          <B label="↷" title="Rétablir" onClick={() => c().redo().run()} />
        </div>
      )}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
