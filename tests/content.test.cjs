const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, path) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    path,
  );
const {
  defaults,
  normalizeContent,
  findPage,
  makePage,
  entryPath,
  publicNavigation,
} = require("../lib/content.ts");
const { contentSchema } = require("../lib/content-schema.ts");
const { cleanHtml } = require("../lib/sanitize.ts");
const clone = (v) => JSON.parse(JSON.stringify(v));
test("legacy content upgrades without overwriting saved settings or entries", () => {
  const old = clone(defaults);
  old.settings.about = "<p>Profil tersimpan</p>";
  old.entries[0].title = "Layanan tersimpan";
  const data = normalizeContent(old);
  assert.equal(findPage(data, "perusahaan").body, old.settings.about);
  assert.equal(data.entries[0].title, "Layanan tersimpan");
  assert.equal(data.schemaVersion, 3);
  assert.equal(data.entries.filter((e) => e.type === "page").length, 12);
  assert.ok(contentSchema.safeParse(data).success);
  assert.equal(old.schemaVersion, undefined);
});
test("legal information includes every certificate number", () => {
  const html = findPage(normalizeContent(defaults), "legalitas").body;
  for (const value of [
    "Rama Br. Saragih",
    "Nurja’far Marpaung",
    "No. 05 Tanggal 4 Oktober 2024",
    "AHU-0002480.AH.01.02",
    "0279 5066 8712 5000",
    "74321 1323.02 6 00022798 2025",
    "74321 1323.02 5 00022800 2025",
    "74321 1323.02 5 00022802 2025",
    "74321 1323.02 5 00022801 2025",
    "73321 3112.05.5 00022803 2025",
    "24100 7212 0010267 2021",
    "00043873",
    "101024009227500110002",
    "101024009227500020001",
    "101024009227500010001",
    "79163/EMP/2025",
    "81617/PT PERTAMINA EP/2025",
    "00041058",
  ])
    assert.ok(html.includes(value), value);
});
test("deleted old and legal pages are not reseeded after saving/reloading", () => {
  const data = normalizeContent(defaults);
  data.entries = data.entries.filter(
    (e) => !["legalitas", "perusahaan", "beranda"].includes(e.slug),
  );
  const reloaded = normalizeContent(clone(data));
  assert.equal(findPage(reloaded, "legalitas"), undefined);
  assert.equal(findPage(reloaded, "perusahaan"), undefined);
  assert.equal(findPage(reloaded, "beranda"), undefined);
  assert.ok(!publicNavigation(reloaded).some((e) => e.slug === "perusahaan"));
});
test("draft and hidden menu pages never appear in navigation", () => {
  const data = normalizeContent(defaults);
  findPage(data, "legalitas").published = false;
  findPage(data, "proyek").showInMenu = false;
  assert.ok(
    !publicNavigation(data).some((e) =>
      ["legalitas", "proyek"].includes(e.slug),
    ),
  );
  assert.equal(findPage(data, "legalitas"), undefined);
  assert.ok(findPage(data, "proyek"));
});
test("homepage and detail paths resolve correctly", () => {
  assert.equal(entryPath(makePage("beranda", "Beranda", "", "", "home")), "/");
  assert.equal(entryPath(makePage("legalitas", "Legalitas")), "/legalitas");
  assert.equal(entryPath(defaults.entries[0]), "/layanan/mekanikal");
});
test("album metadata order and deletion survive a JSON round trip", () => {
  const data = normalizeContent(defaults);
  const e = findPage(data, "legalitas");
  e.gallery = [
    {
      id: "p2",
      src: "/media/12345678-1234-1234-1234-123456789012",
      alt: "Lapangan",
      caption: "Tahap dua",
    },
    {
      id: "p1",
      src: "/images/logo-rss.png",
      alt: "Logo",
      caption: "Tahap satu",
    },
  ];
  const validated = contentSchema.parse(clone(data));
  assert.equal(
    validated.entries.find((e) => e.slug === "legalitas").gallery[0].id,
    "p2",
  );
  e.gallery.shift();
  assert.equal(
    normalizeContent(clone(data)).entries.find((e) => e.slug === "legalitas")
      .gallery.length,
    1,
  );
});
test("invalid media and oversized albums are rejected", () => {
  const data = normalizeContent(defaults),
    e = findPage(data, "legalitas");
  e.gallery = [{ id: "p1", src: "javascript:alert(1)", alt: "", caption: "" }];
  assert.ok(!contentSchema.safeParse(data).success);
  e.gallery = Array.from({ length: 101 }, (_, i) => ({
    id: String(i),
    src: "/images/logo-rss.png",
    alt: "",
    caption: "",
  }));
  assert.ok(!contentSchema.safeParse(data).success);
});
test("duplicate page paths and reserved infrastructure slugs are rejected", () => {
  const data = normalizeContent(defaults);
  data.entries.push({ ...makePage("legalitas", "Duplikat"), id: "different" });
  assert.ok(!contentSchema.safeParse(data).success);
  data.entries.pop();
  data.entries.push(makePage("admin", "Admin"));
  assert.ok(!contentSchema.safeParse(data).success);
});
test("safe table, inline uploaded image and text formatting survive sanitization", () => {
  const html = cleanHtml(
    '<h2 style="text-align: center">Judul</h2><table><tbody><tr><th>Akta</th><td><u>05</u></td></tr></tbody></table><img src="/media/12345678-1234-1234-1234-123456789012" alt="Lapangan"><span style="color: #123456; font-size: 20px">Teks</span>',
  );
  assert.ok(html.includes("<table>"));
  assert.ok(html.includes("<img"));
  assert.ok(html.includes("<u>"));
  assert.ok(html.includes("text-align:center"));
  assert.ok(html.includes("color:#123456"));
});
test("script, handler, unsafe URL, external image and unsafe CSS are removed", () => {
  const html = cleanHtml(
    '<script>alert(1)</script><img src="https://example.com/a.jpg" onerror="alert(1)"><a href="javascript:alert(1)">Link</a><p onclick="alert(1)" style="position:fixed;background:url(javascript:alert(1))">Teks</p>',
  );
  assert.ok(
    !/script|onerror|onclick|position|background|<img|javascript/.test(html),
  );
});
test("table cell spans survive and duplicate photo IDs are rejected", () => {
  assert.ok(
    cleanHtml(
      '<table><tr><td colspan="2" rowspan="2">Gabung</td></tr></table>',
    ).includes('colspan="2"'),
  );
  const data = normalizeContent(defaults);
  findPage(data, "legalitas").gallery = Array.from({ length: 2 }, () => ({
    id: "same",
    src: "/images/logo-rss.png",
    alt: "",
    caption: "",
  }));
  assert.ok(!contentSchema.safeParse(data).success);
});
test("v2 profile upgrade fills empty contacts while preserving edits and deleted core pages", () => {
  const old = normalizeContent(clone(defaults));
  old.schemaVersion = 2;
  old.entries = old.entries.filter(e => !["perusahaan", "legalitas", "visi-misi", "qhsse", "struktur-organisasi", "kebijakan-keselamatan"].includes(e.slug));
  old.settings.email = "saved@example.com";
  old.settings.phone = "";
  old.settings.logo = "/images/logo-rss.png";
  old.settings.footerLogo = "/media/12345678-1234-1234-1234-123456789012";
  delete old.settings.branchAddress;
  const updated = normalizeContent(old);
  assert.equal(updated.settings.email, "saved@example.com");
  assert.equal(updated.settings.phone, "+62 831 3457 7149");
  assert.equal(updated.settings.logo, "/images/logo-rss-transparent.png");
  assert.equal(updated.settings.footerLogo, old.settings.footerLogo);
  assert.ok(updated.settings.branchAddress.includes("Lantai 7"));
  assert.equal(findPage(updated, "perusahaan"), undefined);
  assert.equal(findPage(updated, "legalitas"), undefined);
  assert.ok(findPage(updated, "qhsse").body.includes("2 Januari 2025"));
});
test("all new profile pages and contact values can be deleted without being restored", () => {
  const data = normalizeContent(clone(defaults));
  data.entries = data.entries.filter(e => e.type !== "page");
  for (const key of ["logo", "footerLogo", "address", "branchAddress", "email", "phone"]) data.settings[key] = "";
  data.settings.additionalEmails = [];
  data.settings.additionalPhones = [];
  const reloaded = normalizeContent(clone(contentSchema.parse(data)));
  assert.equal(reloaded.entries.filter(e => e.type === "page").length, 0);
  for (const key of ["logo", "footerLogo", "address", "branchAddress", "email", "phone"]) assert.equal(reloaded.settings[key], "");
  assert.deepEqual(reloaded.settings.additionalPhones, []);
});
test("profile contacts and safe image sizing survive storage validation", () => {
  const data = contentSchema.parse(normalizeContent(clone(defaults)));
  assert.equal(data.settings.additionalEmails[0], "purbarama09@gmail.com");
  assert.equal(data.settings.additionalPhones.length, 2);
  assert.ok(data.settings.address.includes("Medan 20123"));
  const html = cleanHtml('<img src="/images/logo-rss.png" alt="Logo" width="300" style="width:300px;position:fixed">');
  assert.ok(html.includes('width="300"'));
  assert.ok(html.includes("width:300px"));
  assert.ok(!html.includes("position"));
});
