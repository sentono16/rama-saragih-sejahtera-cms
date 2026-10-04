export type Photo = { id: string; src: string; alt: string; caption: string };
export type PageTemplate =
  "article" | "home" | "company" | "contact" | "listing";
export type Entry = {
  id: string;
  type: "service" | "project" | "news" | "page" | "document";
  title: string;
  slug: string;
  summary: string;
  body: string;
  image: string;
  file: string;
  category: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  gallery?: Photo[];
  galleryTitle?: string;
  template?: PageTemplate;
  collection?: "service" | "project" | "news" | "document";
  showInMenu?: boolean;
};
export type Settings = {
  company: string;
  heroTitle: string;
  heroText: string;
  heroImage: string;
  logo: string;
  footerLogo: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  seoTitle: string;
  seoDescription: string;
};
export type Content = {
  settings: Settings;
  entries: Entry[];
  schemaVersion?: number;
};
const services = [
  [
    "Mekanikal",
    "mekanikal",
    "Pekerjaan mekanikal untuk kebutuhan fasilitas industri.",
    "Ruang lingkup meliputi pemasangan dan pekerjaan peralatan mekanikal sesuai kebutuhan proyek. Penggunaan peralatan yang efisien dan koordinasi lapangan menjadi bagian dari pendekatan pelaksanaan.",
  ],
  [
    "Isolasi",
    "isolasi",
    "Pekerjaan isolasi pada pipa dan peralatan industri.",
    "Layanan isolasi mendukung kebutuhan operasional pipa dan peralatan industri. Material, metode, dan ruang lingkup pekerjaan disesuaikan dengan spesifikasi teknis yang disepakati.",
  ],
  [
    "PWHT Service",
    "pwht-service",
    "Post Weld Heat Treatment untuk kebutuhan pekerjaan pengelasan.",
    "Pelaksanaan Post Weld Heat Treatment (PWHT) disesuaikan dengan persyaratan teknis pekerjaan, material, dan kebutuhan proyek. Koordinasi proses menjadi bagian penting dari pengendalian mutu.",
  ],
  [
    "Palm Oil Mill",
    "palm-oil-mill",
    "Dukungan konstruksi dan pekerjaan fasilitas pabrik kelapa sawit.",
    "Pekerjaan untuk fasilitas palm oil mill mencakup kebutuhan konstruksi dan instalasi sesuai ruang lingkup yang disepakati. Tim mengoordinasikan sumber daya, peralatan, dan jadwal pelaksanaan.",
  ],
  [
    "Sipil & Konstruksi",
    "sipil-konstruksi",
    "Pekerjaan sipil untuk pembangunan dan fasilitas industri.",
    "Pekerjaan sipil direncanakan berdasarkan kebutuhan proyek, dengan perhatian pada biaya, mutu, dan waktu pelaksanaan. Koordinasi yang responsif mendukung keputusan di lapangan.",
  ],
  [
    "Blasting & Painting",
    "blasting-painting",
    "Persiapan permukaan dan pengecatan untuk pekerjaan industri.",
    "Layanan blasting dan painting mencakup persiapan permukaan serta aplikasi pelapisan berdasarkan spesifikasi pekerjaan. Pelaksanaan disesuaikan dengan kebutuhan material dan lingkungan operasional.",
  ],
  [
    "Fabrikasi",
    "fabrikasi",
    "Fabrikasi komponen dan struktur untuk kebutuhan proyek.",
    "Pekerjaan fabrikasi dilaksanakan berdasarkan gambar dan spesifikasi yang disepakati. Pengelolaan material, peralatan, serta disiplin kerja mendukung hasil dan jadwal yang terencana.",
  ],
  [
    "Pipa & Tank Equipment",
    "pipa-tank-equipment",
    "Instalasi perpipaan dan peralatan tangki untuk fasilitas industri.",
    "Pekerjaan instalasi pipa dan tank equipment mendukung kebutuhan fasilitas industri, termasuk sektor minyak dan gas. Ruang lingkup dan metode pelaksanaan mengikuti persyaratan proyek.",
  ],
];
export const defaults: Content = {
  settings: {
    company: "PT Rama Saragih Sejahtera",
    heroTitle: "Pengalaman yang membangun.\nKetepatan yang dipercaya.",
    heroText:
      "Jasa konstruksi, mekanikal, dan solusi industri dengan komitmen pada biaya, mutu, serta waktu pelaksanaan.",
    heroImage: "/images/industrial-hero.jpg",
    logo: "/images/logo-rss.png",
    footerLogo: "/images/logo-rss.png",
    about:
      "<p>PT Rama Saragih Sejahtera bergerak di bidang jasa konstruksi dan pekerjaan industri, didukung oleh pengalaman para pengelola yang matang di bidangnya.</p><p>Ruang lingkup usaha kami meliputi mekanikal, isolasi, PWHT service, palm oil mill, sipil, blasting & painting, fabrikasi, serta instalasi pipa dan tank equipment, termasuk kebutuhan sektor minyak dan gas.</p><p>Kami telah bekerja sama dengan sejumlah perusahaan besar dan pabrik berstandar internasional dalam pekerjaan jasa konstruksi maupun penyediaan kebutuhan proyek. Pengalaman ini menjadi landasan untuk mengembangkan layanan di tingkat nasional dan internasional.</p><p>Setiap aktivitas berpedoman pada BMW: Biaya, Mutu, dan Waktu Pelaksanaan yang tepat. Kami mengoptimalkan penggunaan peralatan dan sumber daya, menjalankan disiplin kerja, serta mengutamakan manajemen yang responsif dalam pengambilan keputusan.</p><p>Tujuan kami adalah memberikan manfaat bagi pemberi pekerjaan dan turut berkontribusi dalam pembangunan secara berkelanjutan.</p>",
    email: "",
    phone: "",
    address: "",
    seoTitle: "PT Rama Saragih Sejahtera | Konstruksi & Solusi Industri",
    seoDescription:
      "Jasa mekanikal, isolasi, PWHT, palm oil mill, sipil, blasting painting, fabrikasi, instalasi pipa dan tangki. Berpedoman pada Biaya, Mutu, dan Waktu.",
  },
  entries: services.map((s, i) => ({
    id: "service-" + i,
    type: "service",
    title: s[0],
    slug: s[1],
    summary: s[2],
    body: "<p>" + s[3] + "</p>",
    image: "",
    file: "",
    category: i === 7 ? "Minyak & Gas" : "Layanan Industri",
    published: true,
    seoTitle: s[0] + " | PT Rama Saragih Sejahtera",
    seoDescription: s[2],
  })),
};
export const sectionTypes: Record<string, Entry["type"]> = {
  layanan: "service",
  proyek: "project",
  berita: "news",
  unduhan: "document",
};
export const navigation = [
  ["Beranda", "/"],
  ["Perusahaan", "/perusahaan"],
  ["Layanan", "/layanan"],
  ["Proyek", "/proyek"],
  ["Berita", "/berita"],
];
export function entryPath(e: Entry) {
  return e.type === "page"
    ? e.slug === "beranda"
      ? "/"
      : "/" + e.slug
    : "/" +
        Object.keys(sectionTypes).find((k) => sectionTypes[k] === e.type) +
        "/" +
        e.slug;
}

const legalBody = `<h2>Pengurus Perusahaan</h2>
<table><tbody><tr><th>Penanggung Jawab</th><td>Rama Br. Saragih (Direktur Utama)</td></tr><tr><th>Pelaksana</th><td><ol><li>Syaifuddin Siregar (Direktur)</li><li>Ir. Nurja’far Marpaung (Direktur Operasional)</li><li>Ilham Wahyudi (Komisaris)</li><li>Muhammad Rafli (Komisaris)</li></ol></td></tr></tbody></table>
<h2>Akta dan Pengesahan</h2><table><tbody>
<tr><th>Notaris</th><td>Nurul Aina, SH, M.Kn</td></tr>
<tr><th>Akta Pendirian</th><td>No. 05 Tanggal 4 Oktober 2024</td></tr>
<tr><th>SK Kemenkumham</th><td>AHU- AH.01.09-0265822 Tanggal 21 Oktober 2024</td></tr>
<tr><th>Akta Perubahan ke-1</th><td>No. 13 Tanggal 15 Oktober 2024</td></tr>
<tr><th>SK Kemenkumham ke-1</th><td>AHU-AH.01.09-0265822 Tanggal 21 Oktober 2024</td></tr>
<tr><th>Akta Perubahan ke-2</th><td>No. 07 Tanggal 30 Desember 2024</td></tr>
<tr><th>SK Kemenkumham ke-2</th><td>AHU-0002480.AH.01.02 Tahun 2025 Tanggal 17 Januari 2025</td></tr>
</tbody></table><h2>Perizinan dan Identitas Usaha</h2><table><tbody>
<tr><th>SKDP Domisili</th><td>Nomor 470/5118/2024</td></tr>
<tr><th>NPWP</th><td>0279 5066 8712 5000</td></tr>
<tr><th>NIB Berbasis Risiko</th><td>1010240092275</td></tr>
<tr><th>SPPKP</th><td>S-00070/SPPKP-CT/KPP.0109/2025</td></tr>
</tbody></table><h2>Sertifikat Kompetensi</h2><ul>
<li>Nomor 74321 1323.02 6 00022798 2025 – Jasa Konstruksi Gedung</li>
<li>Nomor 74321 1323.02 5 00022800 2025 – Jasa Konstruksi Gedung</li>
<li>Nomor 74321 1323.02 5 00022802 2025 – Jasa Konstruksi Sipil</li>
<li>Nomor 74321 1323.02 5 00022801 2025 – Jasa Konstruksi Sipil</li>
<li>Nomor 73321 3112.05.5 00022803 2025 – Jasa Konstruksi Elektrikal</li>
<li>Nomor 24100 7212 0010267 2021 – Juru Las SMAW/GTAW</li>
<li>Nomor 00043873 – Ahli Teknik Tenaga Listrik Madya</li>
</ul><h2>Sertifikat Badan Usaha</h2><ul>
<li>Nomor 101024009227500110002 – Konstruksi Gedung</li>
<li>Nomor 101024009227500020001 – Konstruksi Jaringan Irigasi</li>
<li>Nomor 101024009227500010001 – Konstruksi Bangunan Sipil</li>
</ul><h2>Pendaftaran Mitra</h2><table><tbody>
<tr><th>SPDA (SKKMIGAS)</th><td><p>Nomor 79163/EMP/2025</p><p>Nomor 81617/PT PERTAMINA EP/2025</p></td></tr>
<tr><th>SLK Pupuk Iskandar Muda</th><td>User ID eProc 00041058</td></tr>
</tbody></table>`;
export function makePage(
  slug: string,
  title: string,
  summary = "",
  body = "",
  template: PageTemplate = "article",
  collection?: Entry["collection"],
): Entry {
  return {
    id: "page-" + slug,
    type: "page",
    slug,
    title,
    summary,
    body,
    image: "",
    file: "",
    category: "",
    published: true,
    seoTitle: title + " | PT Rama Saragih Sejahtera",
    seoDescription: summary,
    gallery: [],
    galleryTitle: "Dokumentasi Foto",
    template,
    collection,
    showInMenu: true,
  };
}
export function initialPages(settings: Settings): Entry[] {
  return [
    makePage(
      "beranda",
      "Beranda",
      settings.heroText,
      "<h2>Dibangun dari pengalaman. Dijalankan dengan disiplin.</h2><p>PT Rama Saragih Sejahtera hadir untuk mendukung kebutuhan konstruksi dan pekerjaan industri, melalui pengalaman pengelola yang matang dan manajemen yang tanggap.</p><p>Mulai dari pekerjaan mekanikal hingga instalasi pipa dan tangki, setiap ruang lingkup dikelola dengan orientasi pada kepuasan pemberi pekerjaan.</p>",
      "home",
    ),
    makePage(
      "perusahaan",
      "Perusahaan",
      "Profil PT Rama Saragih Sejahtera",
      settings.about,
      "company",
    ),
    makePage(
      "layanan",
      "Layanan",
      "Ruang lingkup pekerjaan sesuai kebutuhan proyek Anda.",
      "",
      "listing",
      "service",
    ),
    makePage(
      "proyek",
      "Proyek",
      "Pelaksanaan yang berpedoman pada biaya, mutu, dan waktu.",
      "",
      "listing",
      "project",
    ),
    makePage(
      "berita",
      "Berita",
      "Informasi dan perkembangan PT Rama Saragih Sejahtera.",
      "",
      "listing",
      "news",
    ),
    makePage(
      "kontak",
      "Kontak",
      "Sampaikan kebutuhan, ruang lingkup, dan rencana pekerjaan Anda.",
      "<h2>Terhubung dengan tim kami.</h2><p>Gunakan formulir untuk pertanyaan layanan, penawaran pekerjaan, atau peluang kerja sama.</p>",
      "contact",
    ),
    makePage(
      "unduhan",
      "Unduhan",
      "Profil dan dokumen pendukung yang tersedia untuk diunduh.",
      "",
      "listing",
      "document",
    ),
    makePage(
      "legalitas",
      "Legalitas Perusahaan",
      "Informasi pengurus, akta, perizinan, sertifikat, dan pendaftaran mitra PT Rama Saragih Sejahtera.",
      legalBody,
    ),
  ].map((page) =>
    page.slug === "beranda"
      ? {
          ...page,
          image: settings.heroImage,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
        }
      : page,
  );
}
// Upgrade legacy JSON once in memory; schemaVersion is persisted on the next save.
// Version 2 never re-seeds deleted pages, so deletion remains effective after reload.
export function normalizeContent(input: Content): Content {
  const entries: Entry[] = input.entries.map((e) => ({
    ...e,
    gallery: e.gallery ?? [],
    galleryTitle: e.galleryTitle ?? "Dokumentasi Foto",
    showInMenu: e.showInMenu ?? true,
  }));
  if ((input.schemaVersion ?? 1) < 2) {
    for (const p of initialPages(input.settings)) {
      if (!entries.some((e) => e.type === "page" && e.slug === p.slug))
        entries.push(p);
    }
  }
  return { ...input, schemaVersion: 2, entries };
}
export function findPage(data: Content, slug: string) {
  return data.entries.find(
    (e) => e.type === "page" && e.slug === slug && e.published,
  );
}
export function publicNavigation(data: Content) {
  return data.entries.filter(
    (e) => e.type === "page" && e.published && e.showInMenu !== false,
  );
}
