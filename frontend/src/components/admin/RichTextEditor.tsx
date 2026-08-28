import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useReducer, useState } from "react";

import { ARTICLE_COLORS, isHttpsUrl, isSafeImageUrl } from "@/lib/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  error?: string;
}

type DialogType = "link" | "image" | "youtube" | null;

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: { openOnClick: false, autolink: false, defaultProtocol: "https" },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  Youtube.configure({ nocookie: true, autoplay: false, controls: true }),
  TextStyleKit,
];

const isYoutubeUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["youtube.com", "www.youtube.com", "youtu.be", "www.youtu.be"].includes(
        url.hostname,
      )
    );
  } catch {
    return false;
  }
};

const toolbarButtonClass = (active = false) =>
  `rounded-md border px-2.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary ${
    active
      ? "border-editorial-primary bg-editorial-soft text-editorial-primary"
      : "border-stone-300 bg-white text-editorial-text hover:bg-stone-50"
  }`;

export const RichTextEditor = ({ value, onChange, error }: RichTextEditorProps) => {
  const [, rerenderToolbar] = useReducer((count) => count + 1, 0);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [url, setUrl] = useState("");
  const [dialogError, setDialogError] = useState("");

  const editor = useEditor({
    content: value,
    extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "article-content min-h-64 rounded-b-xl bg-white px-4 py-3 focus:outline-none",
        "aria-label": "Editor do artigo",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
    onTransaction: rerenderToolbar,
    onSelectionUpdate: rerenderToolbar,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
      rerenderToolbar();
    }
  }, [editor, value]);

  const openDialog = (type: Exclude<DialogType, null>) => {
    setDialog(type);
    setUrl(type === "link" ? editor?.getAttributes("link").href ?? "" : "");
    setDialogError("");
  };

  const closeDialog = () => {
    setDialog(null);
    setUrl("");
    setDialogError("");
  };

  const submitDialog = () => {
    if (!editor || !dialog) return;

    if (dialog === "image") {
      if (!isSafeImageUrl(url)) {
        setDialogError("Informe uma URL HTTPS válida para a imagem.");
        return;
      }
      editor.chain().focus().setImage({ src: url }).run();
    }

    if (dialog === "youtube") {
      if (!isYoutubeUrl(url)) {
        setDialogError("Informe uma URL HTTPS válida do YouTube.");
        return;
      }
      editor.commands.setYoutubeVideo({ src: url });
    }

    if (dialog === "link") {
      if (!isHttpsUrl(url)) {
        setDialogError("Informe uma URL HTTPS válida para o link.");
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }

    closeDialog();
  };

  if (!editor) {
    return <div className="min-h-64 animate-pulse rounded-xl bg-stone-100" aria-label="Carregando editor" />;
  }

  const toggleButtons = [
    {
      label: "Título nível 2",
      active: editor.isActive("heading", { level: 2 }),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      text: "H2",
    },
    {
      label: "Título nível 3",
      active: editor.isActive("heading", { level: 3 }),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      text: "H3",
    },
    {
      label: "Negrito",
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
      text: "B",
    },
    {
      label: "Itálico",
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
      text: "I",
    },
    {
      label: "Sublinhado",
      active: editor.isActive("underline"),
      action: () => editor.chain().focus().toggleUnderline().run(),
      text: "U",
    },
    {
      label: "Lista com marcadores",
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
      text: "• Lista",
    },
    {
      label: "Lista numerada",
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
      text: "1. Lista",
    },
  ];

  const dialogLabel =
    dialog === "image"
      ? "URL HTTPS da imagem"
      : dialog === "youtube"
        ? "URL do vídeo do YouTube"
        : "URL HTTPS do link";
  const submitLabel =
    dialog === "image"
      ? "Adicionar imagem"
      : dialog === "youtube"
        ? "Adicionar vídeo"
        : "Adicionar link";

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div
        className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-t-xl border-b border-stone-200 bg-editorial-surface p-3"
        role="toolbar"
        aria-label="Formatação do artigo"
      >
        {toggleButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            aria-label={button.label}
            aria-pressed={button.active}
            className={toolbarButtonClass(button.active)}
            onClick={button.action}
          >
            {button.text}
          </button>
        ))}

        <button type="button" aria-label="Inserir link" className={toolbarButtonClass(editor.isActive("link"))} onClick={() => openDialog("link")}>
          Link
        </button>
        <button type="button" aria-label="Inserir imagem" className={toolbarButtonClass()} onClick={() => openDialog("image")}>
          Imagem
        </button>
        <button type="button" aria-label="Inserir vídeo do YouTube" className={toolbarButtonClass()} onClick={() => openDialog("youtube")}>
          YouTube
        </button>

        {ARTICLE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Cor ${color}`}
            aria-pressed={editor.isActive("textStyle", { color })}
            className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary"
            style={{ backgroundColor: color }}
            onClick={() => editor.chain().focus().setColor(color).run()}
          />
        ))}

        <button type="button" aria-label="Desfazer" className={toolbarButtonClass()} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </button>
        <button type="button" aria-label="Refazer" className={toolbarButtonClass()} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </button>
      </div>

      <EditorContent editor={editor} />
      {error && <p className="px-4 pb-3 text-sm text-editorial-error">{error}</p>}

      {dialog && (
        <div role="dialog" aria-modal="true" aria-labelledby="rich-text-dialog-title" className="m-3 rounded-lg border border-stone-200 bg-editorial-soft p-4">
          <h3 id="rich-text-dialog-title" className="font-semibold text-editorial-text">
            {submitLabel}
          </h3>
          <label className="mt-3 block text-sm font-medium text-editorial-text">
            {dialogLabel}
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value.trim())}
              className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-primary"
              autoFocus
            />
          </label>
          {dialogError && <p className="mt-2 text-sm text-editorial-error" role="alert">{dialogError}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" className={toolbarButtonClass()} onClick={submitDialog}>{submitLabel}</button>
            <button type="button" className={toolbarButtonClass()} onClick={closeDialog}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};
