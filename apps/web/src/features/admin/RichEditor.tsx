import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function RichEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml || "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <p>Ucitavanje editora...</p>;
  return (
    <div>
      <div>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().toggleBold()}>
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Lista
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
