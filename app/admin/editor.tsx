"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Wrench,
  FolderKanban,
  Newspaper,
  FileText,
  Inbox,
  Plus,
  Save,
  Trash2,
  Eye,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { Content, Entry, entryPath } from "../../lib/content";
import { uploadFile } from "../../lib/upload-client";
import RichEditor from "./rich-editor";
import GalleryEditor from "./gallery-editor";
type Message = {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};
const tabs = [
  ["overview", "Ringkasan", LayoutDashboard],
  ["settings", "Pengaturan Website", Settings],
  ["service", "Layanan", Wrench],
  ["project", "Proyek", FolderKanban],
  ["news", "Berita", Newspaper],
  ["page", "Halaman & Menu", FileText],
  ["document", "Dokumen", FileText],
  ["messages", "Kotak Masuk", Inbox],
] as const;
function UploadField({
  value,
  label,
  note,
  onChange,
  onError,
  onBusy,
}: {
  value: string;
  label: string;
  note: string;
  onChange: (v: string) => void;
  onError: (v: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    onBusy(true);
    try {
      const result = await uploadFile(f);
      onChange(result.url);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Unggahan gagal.");
    } finally {
      setBusy(false);
      onBusy(false);
      e.target.value = "";
    }
  }
  return (
    <div className="upload-field">
      <span className="field-label">{label}</span>
      {value && (
        <div className="upload-preview">
          {!label.toLowerCase().includes("dokumen") ? (
            <img src={value} alt={label} />
          ) : (
            <a href={value} target="_blank" rel="noreferrer">
              Lihat dokumen terunggah
            </a>
          )}
          <button
            type="button"
            className="subtle-button"
            onClick={() => onChange("")}
          >
            Hapus pilihan
          </button>
        </div>
      )}
      <label className="upload-button">
        <Upload size={16} />
        {busy ? "Mengunggah…" : "Pilih & Unggah File"}
        <input
          disabled={busy}
          type="file"
          accept={
            label.toLowerCase().includes("dokumen")
              ? ".pdf,.doc,.docx"
              : ".png,.jpg,.jpeg,.webp"
          }
          onChange={upload}
        />
      </label>
      <small>{note} Maks. 10 MB.</small>
    </div>
  );
}
export default function Admin() {
  const [uploadCount, setUploadCount] = useState(0);
  const onBusy = (busy: boolean) =>
    setUploadCount((n) => Math.max(0, n + (busy ? 1 : -1)));
  const [data, setData] = useState<Content | null>(null),
    [version, setVersion] = useState(0),
    [messages, setMessages] = useState<Message[]>([]),
    [tab, setTab] = useState("overview"),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [dirty, setDirty] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(false),
    [mobile, setMobile] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/cms", { cache: "no-store" });
      const j = (await r.json()) as {
        error: string;
        url: string;
        data: Content;
        version: number;
        messages: Message[];
      };
      if (!r.ok) throw Error(j.error);
      setData(j.data);
      setVersion(j.version);
      setMessages(j.messages);
      setDirty(false);
      setNotice("");
    } catch (e) {
      setError(true);
      setNotice(e instanceof Error ? e.message : "Konten gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function change(d: Content) {
    setData(d);
    setDirty(true);
    setNotice("");
  }
  function setting(k: keyof Content["settings"], v: string) {
    setData((previous) =>
      previous
        ? {
            ...previous,
            settings: { ...previous.settings, [k]: v },
            entries: previous.entries.map((e) =>
              e.type === "page" && e.slug === "beranda"
                ? {
                    ...e,
                    ...(k === "heroImage"
                      ? { image: v }
                      : k === "heroText"
                        ? { summary: v }
                        : k === "seoTitle"
                          ? { seoTitle: v }
                          : k === "seoDescription"
                            ? { seoDescription: v }
                            : {}),
                  }
                : e,
            ),
          }
        : previous,
    );
    setDirty(true);
    setNotice("");
  }
  const dataRef = useRef(data);
  dataRef.current = data;
  const active = data?.entries.find((e) => e.id === selected);
  function update(p: Partial<Entry>) {
    if (active) {
      setData((previous) =>
        previous
          ? {
              ...previous,
              settings:
                active.slug === "beranda" && active.type === "page"
                  ? {
                      ...previous.settings,
                      ...(p.summary !== undefined
                        ? { heroText: p.summary }
                        : {}),
                      ...(p.image !== undefined ? { heroImage: p.image } : {}),
                      ...(p.seoTitle !== undefined
                        ? { seoTitle: p.seoTitle }
                        : {}),
                      ...(p.seoDescription !== undefined
                        ? { seoDescription: p.seoDescription }
                        : {}),
                    }
                  : previous.settings,
              entries: previous.entries.map((e) =>
                e.id === active.id ? { ...e, ...p } : e,
              ),
            }
          : previous,
      );
      setDirty(true);
      setNotice("");
    }
  }
  async function save() {
    if (!data) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, version }),
      });
      const j = (await r.json()) as {
        error: string;
        url: string;
        data: Content;
        version: number;
        messages: Message[];
      };
      if (!r.ok) throw Error(j.error);
      setVersion(j.version);
      setError(false);
      if (dataRef.current === data) {
        setData(j.data);
        setDirty(false);
        setNotice("Semua perubahan telah disimpan dan ditampilkan di website.");
      } else {
        setDirty(true);
        setNotice(
          "Penyimpanan berhasil. Ada perubahan baru yang belum disimpan.",
        );
      }
    } catch (e) {
      setError(true);
      setNotice(e instanceof Error ? e.message : "Penyimpanan gagal.");
    } finally {
      setBusy(false);
    }
  }
  function add() {
    if (!data) return;
    const id = crypto.randomUUID();
    const e: Entry = {
      id,
      type: tab as Entry["type"],
      title: "Konten Baru",
      slug: "konten-" + id.slice(0, 8),
      summary: "",
      body: "<p></p>",
      image: "",
      file: "",
      category: "",
      published: false,
      seoTitle: "",
      seoDescription: "",
      gallery: [],
      galleryTitle: "Dokumentasi Foto",
      template: tab === "page" ? "article" : undefined,
      showInMenu: true,
    };
    change({ ...data, entries: [...data.entries, e] });
    setSelected(id);
  }
  function remove() {
    if (!data || !active) return;
    if (
      window.confirm(
        "Hapus “" +
          active.title +
          "”? Perubahan diterapkan setelah Anda menyimpan.",
      )
    ) {
      change({
        ...data,
        entries: data.entries.filter((e) => e.id !== active.id),
      });
      setSelected("");
    }
  }
  const onError = (s: string) => {
    setError(true);
    setNotice(s);
  };
  const title = tabs.find((t) => t[0] === tab)?.[1] || "";
  return (
    <div className="admin-app">
      {(busy || loading) && <div className="loader-bar" />}
      <aside className={mobile ? "admin-sidebar mobile-open" : "admin-sidebar"}>
        <Link href="/" className="admin-brand">
          RSS<span>CORPORATE CMS</span>
        </Link>
        <button
          className="sidebar-close"
          aria-label="Tutup menu"
          onClick={() => setMobile(false)}
        >
          <X />
        </button>
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              disabled={uploadCount > 0}
              onClick={() => {
                setTab(key);
                setSelected("");
                setMobile(false);
              }}
            >
              <Icon size={18} />
              {label}
              {key === "messages" &&
                messages.some((m) => m.status === "new") && (
                  <span className="count">
                    {messages.filter((m) => m.status === "new").length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            Lihat website
          </Link>
          <button
            className="logout-button"
            onClick={async () => {
              const r = await fetch("/api/auth/logout", { method: "POST" });
              if (r.ok) window.location.assign("/admin/login");
              else onError("Keluar belum berhasil. Coba kembali.");
            }}
          >
            Keluar
          </button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-header">
          <div>
            <button
              className="admin-mobile-toggle"
              aria-label="Buka menu"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <h1>{title}</h1>
            <span>
              {dirty
                ? "Ada perubahan belum disimpan"
                : "Konten website perusahaan"}
            </span>
          </div>
          <button
            className="button"
            onClick={save}
            disabled={!data || busy || loading || uploadCount > 0 || !dirty}
          >
            <Save size={17} />
            {uploadCount > 0
              ? "Menunggu upload…"
              : busy
                ? "Menyimpan…"
                : "Simpan Perubahan"}
          </button>
        </header>
        <div className="admin-body">
          {notice && (
            <div
              role="status"
              className={error ? "notice error" : "notice success"}
            >
              {notice}
              {error && (
                <button
                  className="subtle-button"
                  onClick={() => {
                    if (
                      !dirty ||
                      window.confirm(
                        "Muat ulang dan abaikan perubahan yang belum tersimpan?",
                      )
                    )
                      load();
                  }}
                >
                  Muat ulang
                </button>
              )}
            </div>
          )}
          {loading ? (
            <p>Memuat konten…</p>
          ) : data ? (
            <>
              {tab === "overview" && (
                <>
                  <div className="admin-welcome">
                    <span className="eyebrow dark">PENGELOLAAN WEBSITE</span>
                    <h2>Selamat datang di CMS perusahaan.</h2>
                    <p>
                      Kelola profil, layanan, dan publikasi PT Rama Saragih
                      Sejahtera dari satu tempat.
                    </p>
                  </div>
                  <div className="admin-stat-grid">
                    {[
                      ["service", "Layanan"],
                      ["project", "Proyek"],
                      ["news", "Berita"],
                      ["document", "Dokumen"],
                    ].map(([k, n]) => (
                      <button key={k} onClick={() => setTab(k)}>
                        <span>{n}</span>
                        <strong>
                          {data.entries.filter((e) => e.type === k).length}
                        </strong>
                        <small>
                          {
                            data.entries.filter(
                              (e) => e.type === k && e.published,
                            ).length
                          }{" "}
                          dipublikasikan
                        </small>
                      </button>
                    ))}
                  </div>
                  <div className="admin-panel">
                    <h3>Lengkapi informasi perusahaan</h3>
                    <p>
                      Alamat, email, telepon, serta dokumen perusahaan dapat
                      ditambahkan sesuai data resmi.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => setTab("settings")}
                    >
                      Buka Pengaturan Website
                    </button>
                  </div>
                </>
              )}
              {tab === "settings" && (
                <div className="admin-panel">
                  <h2>Identitas & Beranda</h2>
                  <p>
                    Isi halaman Beranda, Perusahaan, Legalitas, dan halaman
                    utama lain dapat diedit melalui Halaman & Menu.
                  </p>
                  <div className="form-grid">
                    <label>
                      Nama perusahaan
                      <input
                        value={data.settings.company}
                        onChange={(e) => setting("company", e.target.value)}
                      />
                    </label>
                    <label>
                      Email perusahaan
                      <input
                        type="email"
                        value={data.settings.email}
                        onChange={(e) => setting("email", e.target.value)}
                      />
                    </label>
                    <label>
                      Nomor telepon
                      <input
                        value={data.settings.phone}
                        onChange={(e) => setting("phone", e.target.value)}
                      />
                    </label>
                    <label>
                      Alamat
                      <textarea
                        rows={3}
                        value={data.settings.address}
                        onChange={(e) => setting("address", e.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Judul beranda
                    <textarea
                      rows={2}
                      value={data.settings.heroTitle}
                      onChange={(e) => setting("heroTitle", e.target.value)}
                    />
                  </label>
                  <label>
                    Deskripsi beranda
                    <textarea
                      rows={3}
                      value={data.settings.heroText}
                      onChange={(e) => setting("heroText", e.target.value)}
                    />
                  </label>
                  <div className="form-grid">
                    <UploadField
                      label="Logo Header"
                      note="PNG transparan disarankan; 600 × 600 px."
                      value={data.settings.logo}
                      onChange={(v) => setting("logo", v)}
                      onError={onError}
                      onBusy={onBusy}
                    />
                    <UploadField
                      label="Logo Footer"
                      note="PNG transparan disarankan; 600 × 600 px."
                      value={data.settings.footerLogo}
                      onChange={(v) => setting("footerLogo", v)}
                      onError={onError}
                      onBusy={onBusy}
                    />
                  </div>
                  <UploadField
                    label="Gambar Hero"
                    note="Disarankan 1920 × 840 px, format JPG / WEBP."
                    value={data.settings.heroImage}
                    onChange={(v) => setting("heroImage", v)}
                    onError={onError}
                    onBusy={onBusy}
                  />
                  <h3 className="form-section-title">SEO Beranda</h3>
                  <label>
                    Judul SEO
                    <input
                      value={data.settings.seoTitle}
                      onChange={(e) => setting("seoTitle", e.target.value)}
                    />
                  </label>
                  <label>
                    Deskripsi SEO
                    <textarea
                      rows={3}
                      value={data.settings.seoDescription}
                      onChange={(e) =>
                        setting("seoDescription", e.target.value)
                      }
                    />
                  </label>
                </div>
              )}
              {["service", "project", "news", "page", "document"].includes(
                tab,
              ) && (
                <div className="cms-columns">
                  <div className="entry-list">
                    <div>
                      <h2>{title}</h2>
                      <button
                        className="secondary-button"
                        disabled={uploadCount > 0}
                        onClick={add}
                      >
                        <Plus size={16} />
                        Tambah
                      </button>
                    </div>
                    {data.entries
                      .filter((e) => e.type === tab)
                      .map((e) => (
                        <button
                          key={e.id}
                          className={selected === e.id ? "selected" : ""}
                          disabled={uploadCount > 0}
                          onClick={() => setSelected(e.id)}
                        >
                          <strong>{e.title}</strong>
                          <small>
                            {e.published ? "Dipublikasikan" : "Draf"}
                          </small>
                        </button>
                      ))}
                    {data.entries.filter((e) => e.type === tab).length ===
                      0 && (
                      <p>Belum ada konten. Klik Tambah untuk membuatnya.</p>
                    )}
                  </div>
                  <div className="admin-panel">
                    {active ? (
                      <>
                        <div className="editor-heading">
                          <h2>Edit Konten</h2>
                          <button
                            className="danger-button"
                            disabled={uploadCount > 0}
                            onClick={remove}
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                        <div className="form-grid">
                          <label>
                            Judul
                            <input
                              value={active.title}
                              onChange={(e) =>
                                update({ title: e.target.value })
                              }
                            />
                          </label>
                          <label>
                            Slug URL
                            <input
                              value={active.slug}
                              onChange={(e) =>
                                update({
                                  slug: e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-]/g, "-"),
                                })
                              }
                            />
                            <small>Huruf kecil, angka, dan tanda hubung.</small>
                          </label>
                        </div>
                        {active.type === "page" && (
                          <>
                            <label>
                              Jenis halaman
                              <select
                                value={active.template ?? "article"}
                                onChange={(e) =>
                                  update({
                                    template: e.target
                                      .value as Entry["template"],
                                    collection:
                                      e.target.value === "listing"
                                        ? (active.collection ?? "service")
                                        : undefined,
                                  })
                                }
                              >
                                <option value="article">Halaman konten</option>
                                <option value="company">
                                  Profil perusahaan
                                </option>
                                <option value="contact">
                                  Kontak + formulir
                                </option>
                                <option value="listing">Daftar konten</option>
                                <option value="home">
                                  Beranda (slug: beranda)
                                </option>
                              </select>
                            </label>
                            {active.template === "listing" && (
                              <label>
                                Jenis daftar
                                <select
                                  value={active.collection ?? "service"}
                                  onChange={(e) =>
                                    update({
                                      collection: e.target
                                        .value as Entry["collection"],
                                    })
                                  }
                                >
                                  <option value="service">Layanan</option>
                                  <option value="project">Proyek</option>
                                  <option value="news">Berita</option>
                                  <option value="document">Dokumen</option>
                                </select>
                              </label>
                            )}
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={active.showInMenu !== false}
                                onChange={(e) =>
                                  update({ showInMenu: e.target.checked })
                                }
                              />
                              Tampilkan pada menu header dan footer
                            </label>
                          </>
                        )}
                        <label>
                          Kategori
                          <input
                            value={active.category}
                            onChange={(e) =>
                              update({ category: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Deskripsi singkat
                          <textarea
                            rows={3}
                            value={active.summary}
                            onChange={(e) =>
                              update({ summary: e.target.value })
                            }
                          />
                        </label>
                        <span className="field-label">Isi Konten</span>
                        <RichEditor
                          key={active.id}
                          value={active.body}
                          onChange={(v) => update({ body: v })}
                          onError={onError}
                          onBusy={onBusy}
                        />
                        <label>
                          Judul album foto
                          <input
                            maxLength={160}
                            value={active.galleryTitle ?? "Dokumentasi Foto"}
                            onChange={(e) =>
                              update({ galleryTitle: e.target.value })
                            }
                          />
                        </label>
                        <GalleryEditor
                          key={"album-" + active.id}
                          photos={active.gallery ?? []}
                          onChange={(gallery) => update({ gallery })}
                          onError={onError}
                          onBusy={onBusy}
                        />
                        <UploadField
                          label="Gambar Konten"
                          note="Disarankan 1600 × 700 px."
                          value={active.image}
                          onChange={(v) => update({ image: v })}
                          onError={onError}
                          onBusy={onBusy}
                        />
                        {active.type === "document" && (
                          <UploadField
                            label="File Dokumen"
                            note="PDF / DOC / DOCX."
                            value={active.file}
                            onChange={(v) => update({ file: v })}
                            onError={onError}
                            onBusy={onBusy}
                          />
                        )}
                        <label>
                          Judul SEO
                          <input
                            value={active.seoTitle}
                            onChange={(e) =>
                              update({ seoTitle: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Deskripsi SEO
                          <textarea
                            rows={2}
                            value={active.seoDescription}
                            onChange={(e) =>
                              update({ seoDescription: e.target.value })
                            }
                          />
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={active.published}
                            onChange={(e) =>
                              update({ published: e.target.checked })
                            }
                          />
                          Publikasikan konten{active.type === "page" ? "" : ""}
                        </label>
                        {active.published && (
                          <a
                            className="secondary-button"
                            href={entryPath(active)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye size={16} />
                            Lihat Halaman
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="editor-empty">
                        <FileText size={32} />
                        <h2>Pilih konten untuk dikelola.</h2>
                        <p>
                          Gunakan daftar di samping atau tambahkan konten baru.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === "messages" && (
                <div className="admin-panel">
                  <h2>Pesan Pengunjung</h2>
                  <p>
                    Pesan tersimpan di CMS. Pengiriman notifikasi email belum
                    terhubung.
                  </p>
                  {messages.length === 0 ? (
                    <div className="empty">
                      <Inbox size={32} />
                      <h3>Belum ada pesan.</h3>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <article className="message-card" key={m.id}>
                        <div>
                          <h3>{m.subject}</h3>
                          <span className="badge">
                            {m.status === "new" ? "Baru" : "Dibaca"}
                          </span>
                        </div>
                        <p>
                          <strong>{m.name}</strong>
                          {m.company ? " · " + m.company : ""} ·{" "}
                          <a href={"mailto:" + m.email}>{m.email}</a>
                        </p>
                        <small>
                          {new Date(m.created_at).toLocaleString("id-ID")}
                        </small>
                        <p className="message-text">{m.message}</p>
                        {m.status === "new" && (
                          <button
                            className="secondary-button"
                            onClick={async () => {
                              try {
                                const r = await fetch("/api/cms", {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    id: m.id,
                                    status: "read",
                                  }),
                                });
                                if (!r.ok)
                                  throw Error("Status belum tersimpan.");
                                setMessages(
                                  messages.map((x) =>
                                    x.id === m.id
                                      ? { ...x, status: "read" }
                                      : x,
                                  ),
                                );
                              } catch (e) {
                                onError(
                                  e instanceof Error
                                    ? e.message
                                    : "Status gagal diubah.",
                                );
                              }
                            }}
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </article>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <button className="button" onClick={load}>
              Coba Muat Kembali
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
