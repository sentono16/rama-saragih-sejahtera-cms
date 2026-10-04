import { isAdmin, sameOrigin } from "../../../lib/auth";
import { readContent, readMessages, saveContent } from "../../../lib/db";
import { adminClient } from "../../../lib/supabase/admin";
import { cleanHtml } from "../../../lib/sanitize";
import { z } from "zod";
import { contentSchema } from "../../../lib/content-schema";
export async function GET() {
  if (!(await isAdmin()))
    return Response.json({ error: "Akses admin diperlukan." }, { status: 403 });
  try {
    const content = await readContent();
    const messages = await readMessages();
    return Response.json(
      { ...content, messages },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Konten belum dapat dimuat. Coba kembali." },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request) {
  if (!sameOrigin(request) || !(await isAdmin()))
    return Response.json({ error: "Akses ditolak." }, { status: 403 });
  try {
    const { data, version } = z
      .object({ data: contentSchema, version: z.number().int().nonnegative() })
      .parse(await request.json());
    data.settings.about = cleanHtml(data.settings.about);
    data.entries.forEach((e) => (e.body = cleanHtml(e.body)));
    const saved = await saveContent(data, version);
    if (saved === null)
      return Response.json(
        {
          error:
            "Konten telah berubah di sesi lain. Muat ulang sebelum menyimpan.",
        },
        { status: 409 },
      );
    return Response.json({ version: saved, data });
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        error:
          e instanceof z.ZodError
            ? e.issues[0]?.message ||
              "Periksa judul, slug, dan data yang diisi."
            : "Penyimpanan gagal. Perubahan Anda masih tersedia di editor.",
      },
      { status: e instanceof z.ZodError ? 400 : 503 },
    );
  }
}
export async function PATCH(request: Request) {
  if (!sameOrigin(request) || !(await isAdmin()))
    return Response.json({ error: "Akses ditolak." }, { status: 403 });
  try {
    const p = z
      .object({ id: z.string(), status: z.enum(["new", "read"]) })
      .parse(await request.json());
    const { error } = await adminClient()
      .from("rama_contact_messages")
      .update({ status: p.status })
      .eq("id", p.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Status gagal diubah." }, { status: 503 });
  }
}
