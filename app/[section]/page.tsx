import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { publicContent } from "../../lib/db";
import { entryPath, findPage } from "../../lib/content";
import { Shell, ContactForm } from "../site-components";
import Gallery from "../gallery";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const { data } = await publicContent();
  const page = findPage(data, section);
  if (!page) notFound();
  const title = page.seoTitle || page.title,
    description = page.seoDescription || page.summary;
  return {
    title: page.seoTitle ? { absolute: title } : title,
    description,
    openGraph: { title, description, images: page.image ? [page.image] : [] },
    twitter: { images: page.image ? [page.image] : [] },
  };
}
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "beranda") redirect("/");
  const { data, unavailable } = await publicContent();
  const page = findPage(data, section);
  if (!page) notFound();
  const items = data.entries.filter(
    (e) => e.type === page.collection && e.published,
  );
  return (
    <Shell data={data} unavailable={unavailable}>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <span>{page.title}</span>
          </div>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
        </div>
      </section>
      <section
        className={
          "wrap section " +
          (page.template === "contact"
            ? "contact-grid"
            : page.template === "listing"
              ? ""
              : "article")
        }
      >
        {page.template === "contact" ? (
          <>
            <div>
              {page.image && (
                <img
                  className="article-image"
                  src={page.image}
                  alt={page.title}
                />
              )}
              <div
                className="rich"
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
              {data.settings.email && (
                <div className="contact-detail">
                  <small>EMAIL</small>
                  <a href={"mailto:" + data.settings.email}>
                    {data.settings.email}
                  </a>
                </div>
              )}
              {data.settings.phone && (
                <div className="contact-detail">
                  <small>TELEPON</small>
                  <a
                    href={"tel:" + data.settings.phone.replace(/[^+0-9]/g, "")}
                  >
                    {data.settings.phone}
                  </a>
                </div>
              )}
              {data.settings.address && (
                <div className="contact-detail">
                  <small>ALAMAT</small>
                  <p>{data.settings.address}</p>
                </div>
              )}
            </div>
            <ContactForm />
            <div className="contact-album">
              <Gallery photos={page.gallery} title={page.galleryTitle} />
            </div>
          </>
        ) : (
          <>
            {page.image && (
              <img
                className="article-image"
                src={page.image}
                alt={page.title}
              />
            )}
            <div
              className="rich"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
            {page.template === "listing" && (
              <>
                <div className="content-grid">
                  {items.map((e, i) => (
                    <Link
                      key={e.id}
                      href={entryPath(e)}
                      className="content-card"
                    >
                      {e.image ? (
                        <img src={e.image} alt={e.title} />
                      ) : (
                        <span className="card-index">
                          {String(i + 1).padStart(2, "0")}
                          <small>{e.category || "PT RSS"}</small>
                        </span>
                      )}
                      <div>
                        <small>{e.category}</small>
                        <h2>{e.title}</h2>
                        <p>{e.summary}</p>
                        <span className="text-link">
                          {e.type === "document"
                            ? "Lihat dokumen"
                            : "Selengkapnya"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                {items.length === 0 && (
                  <div className="empty">
                    <h2>Belum ada konten yang dipublikasikan.</h2>
                    <p>Silakan kunjungi kembali untuk informasi terbaru.</p>
                  </div>
                )}
              </>
            )}
            <Gallery photos={page.gallery} title={page.galleryTitle} />
            {page.file && (
              <a href={page.file} className="button" download>
                Unduh Dokumen
              </a>
            )}
          </>
        )}
      </section>
    </Shell>
  );
}
