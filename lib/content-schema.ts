import { z } from "zod";
import { mediaUrl } from "./sanitize";
const photo = z.object({
  id: z.string().min(1).max(100),
  src: z.string().min(1).refine(mediaUrl),
  alt: z.string().max(200),
  caption: z.string().max(500),
});
export const entrySchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(["service", "project", "news", "page", "document"]),
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  summary: z.string().max(2000),
  body: z.string().max(200000),
  image: z.string().refine(mediaUrl),
  file: z.string().refine(mediaUrl),
  category: z.string().max(120),
  published: z.boolean(),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(500),
  gallery: z.array(photo).max(100).default([]),
  galleryTitle: z.string().max(160).default("Dokumentasi Foto"),
  template: z
    .enum(["article", "home", "company", "contact", "listing"])
    .optional(),
  collection: z.enum(["service", "project", "news", "document"]).optional(),
  showInMenu: z.boolean().default(true),
});
const settings = z.object({
  company: z.string().min(1).max(160),
  heroTitle: z.string().max(200),
  heroText: z.string().max(600),
  heroImage: z.string().refine(mediaUrl),
  logo: z.string().refine(mediaUrl),
  footerLogo: z.string().refine(mediaUrl),
  about: z.string().max(200000),
  email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().max(60),
  address: z.string().max(500),
  branchAddress: z.string().max(500),
  additionalEmails: z.array(z.string().email().max(200)).max(10),
  additionalPhones: z.array(z.string().min(1).max(60)).max(10),
  footerText: z.string().max(1000),
  contactFormTitle: z.string().max(160),
  contactFormText: z.string().max(1000),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(500),
});
export const contentSchema = z
  .object({
    settings,
    entries: z.array(entrySchema).max(300),
    schemaVersion: z.literal(3),
  })
  .superRefine((data, ctx) => {
    const paths = data.entries.map((e) =>
      e.type === "page" ? e.slug : e.type + "/" + e.slug,
    );
    if (
      new Set(paths).size !== paths.length ||
      new Set(data.entries.map((e) => e.id)).size !== data.entries.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Slug atau identitas konten duplikat.",
      });
    for (const e of data.entries) {
      if (
        e.type === "page" &&
        [
          "admin",
          "api",
          "media",
          "signin-with-chatgpt",
          "signout-with-chatgpt",
          "callback",
          "auth",
        ].includes(e.slug)
      )
        ctx.addIssue({
          code: "custom",
          message: "Slug halaman ini sudah digunakan.",
        });
      if (
        e.type === "page" &&
        ((e.template === "home" && e.slug !== "beranda") ||
          (e.slug === "beranda" && e.template !== "home"))
      )
        ctx.addIssue({
          code: "custom",
          message: "Template Beranda harus menggunakan slug beranda.",
        });
      if (e.template === "listing" && !e.collection)
        ctx.addIssue({ code: "custom", message: "Pilih jenis daftar konten." });
      if (
        new Set((e.gallery ?? []).map((p) => p.id)).size !==
        (e.gallery ?? []).length
      )
        ctx.addIssue({
          code: "custom",
          message: "Identitas foto album duplikat.",
        });
    }
  });
