import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const toolbarButtonBase =
  "rounded border px-2 py-1 text-sm transition-colors disabled:opacity-50";
const toolbarButtonIdle = "border-brand-muted bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";
const toolbarButtonActive =
  "border-brand-quiz bg-brand-muted/25 font-bold text-brand-quiz dark:text-fuchsia-300";

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
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className={`${toolbarButtonBase} ${
            editor.isActive("bold") ? toolbarButtonActive : toolbarButtonIdle
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().toggleBold()}
        >
          B
        </button>
        <button
          type="button"
          className={`${toolbarButtonBase} ${
            editor.isActive("italic") ? toolbarButtonActive : toolbarButtonIdle
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={`${toolbarButtonBase} ${
            editor.isActive("bulletList") ? toolbarButtonActive : toolbarButtonIdle
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="tiptap min-h-[120px] rounded border border-brand-muted bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 [&_.ProseMirror:focus]:outline-none"
      />
    </div>
  );
}
