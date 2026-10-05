"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { uploadFile } from "../../lib/upload-client";
import { cleanHtmlClientLink } from "./editor-utils";
const EditableImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), width: {
      default: null,
      parseHTML: element => element.getAttribute("width"),
      renderHTML: attrs => Number(attrs.width) >= 100 && Number(attrs.width) <= 2400
        ? { width: String(Number(attrs.width)), style: `width: ${Number(attrs.width)}px` } : {},
    } };
  },
});
export default function RichEditor({
  value,
  onChange,
  onError,
  onBusy,
}: {
  value: string;
  onChange: (v: string) => void;
  onError: (v: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const imageInput = useRef<HTMLInputElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false),
    [source, setSource] = useState(false),
    [html, setHtml] = useState(value);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false },
      }),
      EditableImage.configure({ allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit,
      TextStyleKit,
    ],
    content: value,
    onUpdate: ({ editor }) => changeRef.current(editor.getHTML()),
    editorProps: {
      attributes: {
        "aria-label": "Isi konten",
        role: "textbox",
        "aria-multiline": "true",
        class: "editor-content rich",
      },
    },
  });
  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);
  const [, redraw] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => redraw((v) => v + 1);
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);
  async function insertFiles(files: FileList | null, isImage: boolean) {
    if (!files?.length || !editor) return;
    const list = Array.from(files);
    if (isImage && list.some((f) => !/^image\/(png|jpeg|webp)$/.test(f.type))) {
      onError("Pilih gambar PNG, JPG, atau WEBP.");
      return;
    }
    setUploading(true);
    onBusy(true);
    try {
      for (const file of list) {
        const r = await uploadFile(file);
        if (isImage)
          editor
            .chain()
            .focus()
            .setImage({ src: r.url, alt: file.name.replace(/\.[^.]+$/, "") })
            .run();
        else
          editor
            .chain()
            .focus()
            .insertContent({
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: file.name,
                  marks: [{ type: "link", attrs: { href: r.url } }],
                },
              ],
            })
            .run();
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
      onBusy(false);
      if (imageInput.current) imageInput.current.value = "";
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  if (!editor) return <p>Memuat editor…</p>;
  const button = (
    label: string,
    action: () => void,
    active = false,
    disabled = false,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled || uploading || source}
      className={active ? "active" : ""}
      onMouseDown={(e) => e.preventDefault()}
      onClick={action}
    >
      {label}
    </button>
  );
  function link() {
    const current = editor?.getAttributes("link").href || "";
    const href = window.prompt(
      "URL tautan (https://…, mailto:…, tel:…, atau /halaman)",
      current,
    );
    if (href === null) return;
    if (!href) {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    if (!cleanHtmlClientLink(href)) {
      onError("URL tautan tidak valid.");
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }
  return (
    <div className="rich-editor">
      <div className="editor-toolbar" role="toolbar" aria-label="Format konten">
        <select
          aria-label="Format paragraf"
          disabled={source || uploading}
          value={
            editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : "p"
          }
          onChange={(e) =>
            e.target.value === "p"
              ? editor.chain().focus().setParagraph().run()
              : editor
                  .chain()
                  .focus()
                  .setHeading({
                    level: Number(e.target.value.slice(1)) as 2 | 3 | 4,
                  })
                  .run()
          }
        >
          <option value="p">Paragraf</option>
          <option value="h2">Judul 2</option>
          <option value="h3">Judul 3</option>
          <option value="h4">Judul 4</option>
        </select>
        {button(
          "Tebal",
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
        )}
        {button(
          "Miring",
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
        )}
        {button(
          "Garis bawah",
          () => editor.chain().focus().toggleUnderline().run(),
          editor.isActive("underline"),
        )}
        {button(
          "Coret",
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive("strike"),
        )}
        {button(
          "Daftar",
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
        )}
        {button(
          "Penomoran",
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList"),
        )}
        {button("Tambah indentasi", () =>
          editor.chain().focus().sinkListItem("listItem").run(),
        )}
        {button("Kurangi indentasi", () =>
          editor.chain().focus().liftListItem("listItem").run(),
        )}
        {(["left", "center", "right", "justify"] as const).map((a, i) =>
          button(
            ["Rata kiri", "Rata tengah", "Rata kanan", "Rata penuh"][i],
            () => editor.chain().focus().setTextAlign(a).run(),
            editor.isActive({ textAlign: a }),
          ),
        )}
        <select
          aria-label="Ukuran teks"
          disabled={source || uploading}
          value={editor.getAttributes("textStyle").fontSize || ""}
          onChange={(e) =>
            e.target.value
              ? editor.chain().focus().setFontSize(e.target.value).run()
              : editor.chain().focus().unsetFontSize().run()
          }
        >
          <option value="">Ukuran teks</option>
          {[12, 14, 16, 18, 20, 24, 28, 32, 36].map((n) => (
            <option key={n} value={n + "px"}>
              {n} px
            </option>
          ))}
        </select>
        <select
          aria-label="Jenis font"
          disabled={source || uploading}
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onChange={(e) =>
            e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run()
          }
        >
          <option value="">Font</option>
          {["Arial", "Georgia", "Verdana", "Tahoma", "Times New Roman"].map(
            (f) => (
              <option key={f}>{f}</option>
            ),
          )}
        </select>
        <label className="color-tool">
          Warna
          <input
            aria-label="Warna teks"
            type="color"
            disabled={source || uploading}
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        {button("Tautan", link, editor.isActive("link"))}
        {button("Hapus tautan", () => editor.chain().focus().unsetLink().run())}
        {button(
          "Kutipan",
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive("blockquote"),
        )}
        {button("Garis pemisah", () =>
          editor.chain().focus().setHorizontalRule().run(),
        )}
        {button("Tabel", () =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
            .run(),
        )}
        {editor.isActive("table") && (
          <>
            {button("+ Baris", () =>
              editor.chain().focus().addRowAfter().run(),
            )}
            {button("− Baris", () => editor.chain().focus().deleteRow().run())}
            {button("+ Kolom", () =>
              editor.chain().focus().addColumnAfter().run(),
            )}
            {button("− Kolom", () =>
              editor.chain().focus().deleteColumn().run(),
            )}
            {button("Gabung sel", () =>
              editor.chain().focus().mergeCells().run(),
            )}
            {button("Pisah sel", () =>
              editor.chain().focus().splitCell().run(),
            )}
            {button("Hapus tabel", () =>
              editor.chain().focus().deleteTable().run(),
            )}
          </>
        )}
        {button("Upload gambar", () => imageInput.current?.click())}
        {button("Upload dokumen", () => fileInput.current?.click())}
        {button("Edit gambar", () => {
          const attrs = editor.getAttributes("image");
          const alt = window.prompt("Deskripsi gambar (teks alternatif):", attrs.alt || "");
          if (alt === null) return;
          const width = window.prompt("Lebar gambar dalam piksel (100–2400). Kosongkan untuk lebar otomatis:", attrs.width || "");
          if (width === null) return;
          if (width && (!/^\d+$/.test(width) || Number(width) < 100 || Number(width) > 2400)) { onError("Lebar gambar harus antara 100 dan 2400 piksel."); return; }
          editor.chain().focus().updateAttributes("image", { alt: alt.slice(0, 200), width: width || null }).run();
        }, false, !editor.isActive("image"))}
        {button(
          "Hapus gambar",
          () => editor.chain().focus().deleteSelection().run(),
          false,
          !editor.isActive("image"),
        )}
        {button(
          "Undo",
          () => editor.chain().focus().undo().run(),
          false,
          !editor.can().undo(),
        )}
        {button(
          "Redo",
          () => editor.chain().focus().redo().run(),
          false,
          !editor.can().redo(),
        )}
        {button("Hapus format", () =>
          editor.chain().focus().unsetAllMarks().clearNodes().run(),
        )}
        <button
          type="button"
          disabled={uploading}
          aria-pressed={source}
          onClick={() => {
            if (source) {
              editor.commands.setContent(html);
              onChange(editor.getHTML());
            } else setHtml(editor.getHTML());
            setSource(!source);
          }}
        >
          {source ? "Terapkan HTML" : "HTML"}
        </button>
      </div>
      <input
        ref={imageInput}
        type="file"
        hidden
        multiple
        accept=".png,.jpg,.jpeg,.webp"
        aria-label="Pilih gambar untuk konten"
        onChange={(e) => void insertFiles(e.target.files, true)}
      />
      <input
        ref={fileInput}
        type="file"
        hidden
        accept=".pdf,.doc,.docx"
        aria-label="Pilih dokumen untuk konten"
        onChange={(e) => void insertFiles(e.target.files, false)}
      />
      {source ? (
        <textarea
          className="html-source"
          aria-label="Sumber HTML"
          value={html}
          onChange={(e) => {
            setHtml(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
      <div className="editor-status">
        {uploading
          ? "Mengunggah file…"
          : "PNG / JPG / WEBP dan PDF / DOC / DOCX, maksimum 10 MB per file. Pilih gambar untuk mengedit ukuran/deskripsi atau menghapusnya. Kelompok foto proyek dapat diunggah melalui Album Foto di bawah editor."}
      </div>
    </div>
  );
}
