# PT Rama Saragih Sejahtera — Corporate CMS

Next.js App Router website, designed for GitHub + Vercel + Supabase.

## Features

- Indonesian corporate website, company profile, eight services, projects, news, custom pages and downloads.
- CMS at `/admin`, email/password login at `/admin/login` using Supabase Auth.
- Supabase Postgres for content, inbox and media metadata; private `rama-media` Storage bucket.
- Rich text editor, content SEO, header/footer logos, hero image, draft/publish controls.
- Uploaded media is validated before publication. Files upload directly to Supabase, up to 10 MB.
- Content version checks prevent one editor from silently overwriting another editor's save.
- Draft entries are excluded from public page payloads.

## Setup

1. Create a private GitHub repository named `rama-saragih-sejahtera-cms` and push this project to `main`.
2. Create a Supabase project. Apply `supabase/migrations/20261003143000_rama_cms.sql` using the SQL editor or migration tooling.
3. In Supabase Authentication, create a confirmed admin user with the email used in `CMS_ADMIN_EMAIL`. Set the password privately. Public signup is unnecessary and can be disabled.
4. Import the GitHub repository into Vercel as a Next.js project. Configure the environment variables below before deployment.
5. Set Supabase Auth's Site URL to the deployment's canonical URL. If Auth redirects are added later, allowlist only the required URLs.
6. Deploy and check the homepage, admin login, save, media upload, contact submission and inbox.

## Environment variables

Copy `.env.example` to `.env.local` for local development. In Vercel, add the same values for Production and the environments that should access this database.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase API key; legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key for database/storage operations; never commit or expose in client code |
| `CMS_ADMIN_EMAIL` | Exact email of the one authorized CMS administrator |
| `NEXT_PUBLIC_SITE_URL` | Canonical website URL for metadata; Vercel's production URL is used when this is unset |

All database tables use the `rama_` prefix. Row Level Security is enabled and direct anonymous/authenticated table access is denied. Writes are made by server routes only after authentication/validation. The service key must stay server-only.

## Development

```bash
npm ci
npm run dev
npm run typecheck
npm run build
```

## Automatic deployment

Once Vercel imports and links this GitHub repository, commits pushed to its production branch trigger production deployments. Other branches can produce preview deployments. CMS updates use dynamic server rendering, so they appear after saving without requiring a redeploy.

Reference: https://vercel.com/docs/git/vercel-for-github

## Data migration status

On 3 October 2026, the original private website's content, message and upload tables contained no saved rows. The company profile and eight service records are included as the initial content defaults in `lib/content.ts`. They become persisted in Postgres on the first CMS save. No private user messages, external API credentials or admin password are included in this repository.

## Notifications

Contact form messages are stored in the CMS inbox. Email notifications are not configured.
