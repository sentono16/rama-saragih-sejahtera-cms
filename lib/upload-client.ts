"use client";
import { browserClient } from "./supabase/client";
export async function uploadFile(file: File) {
  if (file.size > 10000000) throw Error("Maksimum 10 MB per file.");
  const request = { name: file.name, size: file.size };
  const prepared = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, phase: "prepare" }),
  });
  const p = await prepared.json();
  if (!prepared.ok) throw Error(p.error || "Persiapan upload gagal.");
  const { error } = await browserClient()
    .storage.from("rama-media")
    .uploadToSignedUrl(p.id, p.token, file, { contentType: p.type });
  if (error) throw error;
  const completed = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, id: p.id, phase: "complete" }),
  });
  const result = await completed.json();
  if (!completed.ok) throw Error(result.error || "Upload gagal.");
  return result as { url: string; name: string; type: string };
}
