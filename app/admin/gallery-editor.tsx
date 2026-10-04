"use client";
import { useRef, useState } from "react";
import { Photo } from "../../lib/content";
import { uploadFile } from "../../lib/upload-client";
export default function GalleryEditor({
  photos,
  onChange,
  onError,
  onBusy,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  onError: (error: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [progress, setProgress] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (photos.length + selected.length > 100) {
      onError("Maksimum 100 foto per album.");
      return;
    }
    if (
      selected.some(
        (f) => !/^image\/(png|jpeg|webp)$/.test(f.type) || f.size > 10000000,
      )
    ) {
      onError("Pilih PNG, JPG, atau WEBP, maksimum 10 MB per foto.");
      return;
    }
    setBusy(true);
    onBusy(true);
    const next = [...photos];
    try {
      for (let i = 0; i < selected.length; i++) {
        setProgress(`Mengunggah ${i + 1} dari ${selected.length} foto…`);
        const file = selected[i],
          result = await uploadFile(file);
        next.push({
          id: crypto.randomUUID(),
          src: result.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          caption: "",
        });
        onChange([...next]);
      }
    } catch (e) {
      onError(
        e instanceof Error
          ? e.message
          : "Upload album gagal. Foto yang sudah berhasil tetap ada.",
      );
    } finally {
      setBusy(false);
      onBusy(false);
      setProgress("");
      if (input.current) input.current.value = "";
    }
  }
  function move(i: number, delta: number) {
    const next = [...photos],
      target = i + delta;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }
  return (
    <section className="gallery-editor">
      <div className="section-top">
        <h3>Album Foto</h3>
        <button
          type="button"
          className="secondary-button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          Upload beberapa foto
        </button>
      </div>
      <p>
        PNG / JPG / WEBP, maksimum 10 MB per foto dan 100 foto per album. Simpan
        Perubahan untuk menampilkan album.
      </p>
      <input
        ref={input}
        hidden
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.webp"
        aria-label="Pilih foto album"
        onChange={(e) => void upload(e.target.files)}
      />
      {progress && <p role="status">{progress}</p>}
      <div className="album-admin-grid">
        {photos.map((photo, i) => (
          <article className="album-photo-editor" key={photo.id}>
            <img src={photo.src} alt={photo.alt} />
            <label>
              Teks alternatif
              <input
                disabled={busy}
                maxLength={200}
                value={photo.alt}
                onChange={(e) =>
                  onChange(
                    photos.map((p) =>
                      p.id === photo.id ? { ...p, alt: e.target.value } : p,
                    ),
                  )
                }
              />
            </label>
            <label>
              Keterangan foto
              <textarea
                disabled={busy}
                maxLength={500}
                rows={2}
                value={photo.caption}
                onChange={(e) =>
                  onChange(
                    photos.map((p) =>
                      p.id === photo.id ? { ...p, caption: e.target.value } : p,
                    ),
                  )
                }
              />
            </label>
            <div className="album-actions">
              <button
                type="button"
                disabled={busy || i === 0}
                className="secondary-button"
                aria-label={"Pindahkan foto " + (i + 1) + " lebih awal"}
                onClick={() => move(i, -1)}
              >
                Naik
              </button>
              <button
                type="button"
                disabled={busy || i === photos.length - 1}
                className="secondary-button"
                aria-label={"Pindahkan foto " + (i + 1) + " lebih akhir"}
                onClick={() => move(i, 1)}
              >
                Turun
              </button>
              <button
                type="button"
                className="danger-button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Hapus foto ini dari album?"))
                    onChange(photos.filter((p) => p.id !== photo.id));
                }}
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>
      {photos.length === 0 && (
        <p className="album-empty">Belum ada foto dalam album.</p>
      )}
    </section>
  );
}
