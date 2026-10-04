"use client";
import { useEffect, useRef, useState } from "react";
import { Photo } from "../lib/content";
export default function Gallery({
  photos = [],
  title = "Dokumentasi Foto",
}: {
  photos?: Photo[];
  title?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected !== null && dialog.current && !dialog.current.open)
      dialog.current.showModal();
  }, [selected]);
  if (!photos.length) return null;
  const active = selected === null ? null : photos[selected];
  function close() {
    dialog.current?.close();
    setSelected(null);
  }
  return (
    <section className="photo-album">
      <div className="section-top">
        <h2>{title || "Dokumentasi Foto"}</h2>
        <span>{photos.length} foto</span>
      </div>
      <div className="album-grid">
        {photos.map((p, i) => (
          <figure key={p.id}>
            <button
              type="button"
              onClick={() => setSelected(i)}
              aria-label={
                "Perbesar foto: " + (p.alt || p.caption || String(i + 1))
              }
            >
              <img src={p.src} alt={p.alt} loading="lazy" />
            </button>
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label={title || "Dokumentasi Foto"}
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setSelected((i) => (i === null ? 0 : (i + 1) % photos.length));
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setSelected((i) =>
              i === null ? 0 : (i + photos.length - 1) % photos.length,
            );
          }
        }}
      >
        <div className="photo-dialog-inner">
          <button
            type="button"
            className="dialog-close"
            autoFocus
            aria-label="Tutup foto"
            onClick={close}
          >
            Tutup ✕
          </button>
          {active && (
            <>
              <img src={active.src} alt={active.alt} />
              <p>{active.caption || active.alt}</p>
              <div className="photo-dialog-nav">
                <button
                  type="button"
                  disabled={photos.length < 2}
                  onClick={() =>
                    setSelected((i) =>
                      i === null ? 0 : (i + photos.length - 1) % photos.length,
                    )
                  }
                >
                  Sebelumnya
                </button>
                <span>
                  {(selected ?? 0) + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  disabled={photos.length < 2}
                  onClick={() =>
                    setSelected((i) =>
                      i === null ? 0 : (i + 1) % photos.length,
                    )
                  }
                >
                  Berikutnya
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </section>
  );
}
