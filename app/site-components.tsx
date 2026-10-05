"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Mail, Phone, MapPin, ChevronRight, Send } from "lucide-react";
import { Content, Settings, publicNavigation, entryPath } from "../lib/content";
export function OfficeAddresses({ settings }: { settings: Settings }) {
  return <div className="office-addresses">{[
    ["Kantor Pusat", settings.address], ["Kantor Cabang", settings.branchAddress],
  ].filter(([, address]) => address).map(([title, address]) => (
    <div className="office-address" key={title}>
      <MapPin size={18} aria-hidden="true" />
      <div><h3>{title}</h3><address>{address}</address>
        <a className="map-link" href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address)} target="_blank" rel="noreferrer">Lihat lokasi <ChevronRight size={14} aria-hidden="true" /></a>
      </div>
    </div>
  ))}</div>;
}
export function ContactLinks({ settings }: { settings: Settings }) {
  const emails = [...new Set([settings.email, ...settings.additionalEmails].filter(Boolean))];
  const phones = [...new Set([settings.phone, ...settings.additionalPhones].filter(Boolean))];
  return <div className="contact-links">
    {emails.length > 0 && <div><span className="contact-label">Email</span>{emails.map(email => <a key={email} href={"mailto:" + email}><Mail size={16} aria-hidden="true" /><span>{email}</span></a>)}</div>}
    {phones.length > 0 && <div><span className="contact-label">Telepon</span>{phones.map(phone => <a key={phone} href={"tel:" + phone.replace(/[^+0-9]/g, "")}><Phone size={16} aria-hidden="true" /><span>{phone}</span></a>)}</div>}
  </div>;
}
export function Shell({
  data,
  children,
  unavailable = false,
}: {
  data: Content;
  children: React.ReactNode;
  unavailable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const s = data.settings;
  const allPages = publicNavigation(data);
  const primary = allPages.filter((e) =>
    ["beranda", "perusahaan", "layanan", "proyek", "berita"].includes(e.slug),
  );
  const pages = allPages.filter(
    (e) =>
      ![
        "beranda",
        "perusahaan",
        "layanan",
        "proyek",
        "berita",
        "kontak",
      ].includes(e.slug),
  );
  const contact = allPages.find((e) => e.slug === "kontak");
  return (
    <>
      <a className="skip" href="#main">
        Lewati ke konten
      </a>
      <div className="topbar">
        <div className="wrap">
          <span>KONSTRUKSI · MEKANIKAL · INDUSTRI</span>
          <span>Biaya. Mutu. Waktu.</span>
        </div>
      </div>
      <header className="header">
        <div className="wrap header-inner">
          <Link className="brand" href="/" onClick={() => setOpen(false)}>
            {s.logo && <img src={s.logo} alt={"Logo " + s.company} />}
            <span>
              {s.company}
              <small>CONSTRUCTION & INDUSTRIAL SERVICES</small>
            </span>
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            aria-label="Navigasi utama"
            className={open ? "nav open" : "nav"}
          >
            {primary.map((e) => (
              <Link
                key={e.id}
                href={entryPath(e)}
                onClick={() => setOpen(false)}
              >
                {e.title}
              </Link>
            ))}
            {pages.length > 0 && (
              <details>
                <summary>Informasi</summary>
                <div className="dropdown">
                  {pages.map((e) => (
                    <Link
                      key={e.id}
                      href={entryPath(e)}
                      onClick={() => setOpen(false)}
                    >
                      {e.title}
                    </Link>
                  ))}
                </div>
              </details>
            )}
            {contact && (
              <Link
                className="button nav-contact"
                href={entryPath(contact)}
                onClick={() => setOpen(false)}
              >
                {contact.title}
              </Link>
            )}
          </nav>
        </div>
      </header>
      {unavailable && (
        <div className="storage-warning" role="status">
          Konten terbaru sementara belum dapat dimuat. Silakan coba kembali.
        </div>
      )}
      <main id="main">{children}</main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <div className="footer-brand">
              {s.footerLogo && <img src={s.footerLogo} alt={"Logo " + s.company} />}
              <h3>{s.company}</h3>
            </div>
            <p>{s.footerText}</p>
            <span className="gold smallcaps">BMW YANG TEPAT</span>
          </div>
          <nav className="footer-navigation" aria-label="Navigasi footer">
            <h4>Jelajahi</h4>
            {allPages
              .filter((e) => e.slug !== "beranda")
              .map((e) => (
                <Link key={e.id} href={entryPath(e)}>
                  <ChevronRight size={14} aria-hidden="true" />
                  {e.title}
                </Link>
              ))}
          </nav>
          <div className="footer-offices">
            <h4>Kantor Kami</h4>
            <OfficeAddresses settings={s} />
          </div>
          <div>
            <h4>Hubungi Kami</h4>
            <ContactLinks settings={s} />
            {contact && (
              <Link className="footer-contact-link" href={entryPath(contact)}><ChevronRight size={14} aria-hidden="true" />Kirim pertanyaan proyek</Link>
            )}
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>
            © {new Date().getFullYear()} {s.company}.
          </span>
          <Link href="/admin">Admin CMS</Link>
        </div>
      </footer>
    </>
  );
}
export function ContactForm({ title, description }: { title: string; description: string }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [success, setSuccess] = useState(false);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setSuccess(false);
    setMessage("");
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = (await r.json()) as { error: string; ok?: boolean };
      if (!r.ok) throw Error(j.error);
      setSuccess(true);
      setMessage(
        "Terima kasih. Pesan Anda telah diterima dan tersimpan untuk ditinjau tim kami.",
      );
      form.reset();
    } catch (e) {
      setSuccess(false);
      setMessage(
        e instanceof Error ? e.message : "Pesan belum terkirim. Coba kembali.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={send} aria-busy={busy}>
      <span className="eyebrow dark">PERTANYAAN & KERJA SAMA</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <fieldset disabled={busy}>
      <div className="form-grid">
        <label>
          Nama lengkap <span className="required-mark">*</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Nama Anda"
          />
        </label>
        <label>
          Email <span className="required-mark">*</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="nama@perusahaan.com" />
        </label>
        <label>
          Perusahaan (opsional)
          <input name="company" maxLength={150} autoComplete="organization" placeholder="Nama perusahaan" />
        </label>
        <label>
          Topik
          <select name="subject">
            <option>Informasi layanan</option>
            <option>Penawaran proyek</option>
            <option>Kerja sama</option>
            <option>Pertanyaan umum</option>
          </select>
        </label>
      </div>
      <label>
        Pesan <span className="required-mark">*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Lokasi proyek, pekerjaan yang dibutuhkan, dan rencana waktu pelaksanaan…"
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <p className="form-help">* Wajib diisi. Pesan Anda akan ditinjau oleh tim perusahaan.</p>
      <button className="button" disabled={busy}>
        <Send size={16} aria-hidden="true" />
        {busy ? "Mengirim…" : "Kirim Pesan"}
      </button>
      </fieldset>
      {message && (
        <p
          role="status"
          className={success ? "notice success" : "notice error"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
