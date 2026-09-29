import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Authors } from "./cms/collections/authors";
import { Media } from "./cms/collections/media";
import { Blog, News } from "./cms/collections/posts";
import { Users } from "./cms/collections/users";
import { articleEditor } from "./cms/editor";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * CMS emails (password resets) go through the same Resend account and sender as Book a demo:
 * DEMO_FROM_EMAIL ("Name <address>") or Resend's test sender. Without RESEND_API_KEY they are
 * printed to the server console instead.
 */
function emailAdapter() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return undefined;
  const from = process.env.DEMO_FROM_EMAIL?.trim() || "Niticore <onboarding@resend.dev>";
  const match = /^(.*)<(.+)>$/.exec(from);
  return resendAdapter({
    apiKey,
    defaultFromName: match?.[1].trim() || "Niticore",
    defaultFromAddress: (match?.[2] ?? from).trim(),
  });
}

/**
 * Payload CMS: the admin at /admin, where the team writes Blog posts and News. The site reads
 * posts on the server through Payload's Local API (lib/cms.ts); nothing public is served from
 * /api except image files when they are stored locally.
 *
 * - Database: Postgres at DATABASE_URL (Neon from the Vercel Marketplace in production). The schema
 *   only ever changes through the migrations in src/migrations: production runs them on start-up,
 *   so a deploy brings its database up to date by itself; locally, run `npm run migrate`.
 *   Payload's dev "push" (rewriting tables to match the code) is off, so a local .env pointing at
 *   a shared database can never alter it by accident.
 * - Images: Vercel Blob when BLOB_READ_WRITE_TOKEN is set, else the /media folder.
 * - Schema changes: edit a collection, then `npm run migrate:create <name>` and commit the new
 *   file in src/migrations (plus `npm run generate:types`).
 */
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    theme: "dark",
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " | Niticore CMS",
      icons: [{ rel: "icon", type: "image/x-icon", url: "/favicon.ico" }],
      robots: "noindex, nofollow",
    },
    components: {
      graphics: {
        Logo: "/cms/admin/brand#Logo",
        Icon: "/cms/admin/brand#Icon",
      },
    },
  },
  collections: [Blog, News, Authors, Media, Users],
  editor: articleEditor,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    prodMigrations: migrations,
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Serve images straight from the Blob CDN rather than through this app (they are public)
      collections: { media: { disablePayloadAccessControl: true } },
      // Keep the same database columns with or without Blob, so one set of migrations fits both
      alwaysInsertFields: true,
      // Big uploads go from the browser to Blob directly, past Vercel's 4.5 MB request limit
      clientUploads: true,
    }),
  ],
  email: emailAdapter(),
  sharp,
  // The site reads content on the server; no public GraphQL endpoint or playground
  graphQL: { disable: true },
  // No usage reporting to Payload: the site runs no analytics, and the CMS shouldn't either
  telemetry: false,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
