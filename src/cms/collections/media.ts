import path from "node:path";
import type { CollectionConfig } from "payload";
import { anyone, signedIn } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

/**
 * Images for covers, avatars and article bodies. With BLOB_READ_WRITE_TOKEN set (production), files
 * go to Vercel Blob (see payload.config.ts); without it (local development) they are written to
 * /media in the project, which git ignores.
 *
 * Originals are capped at 2400px wide on upload. next/image makes every smaller size from that, so
 * no extra sizes are stored. The focal point set in the admin keeps the subject in frame when a
 * card crops the image.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Media" },
  admin: {
    group: "Content",
    defaultColumns: ["filename", "alt", "updatedAt"],
    description: "Photos and illustrations for covers, author photos and articles.",
  },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    // Raster formats only: next/image won't optimise SVG, and SVG can carry scripts
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    resizeOptions: { width: 2400, withoutEnlargement: true },
    focalPoint: true,
    crop: true,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: "alt",
      label: "Alt text",
      type: "text",
      required: true,
      admin: {
        description:
          "Describe what the image actually shows, for people using screen readers. For example: “Two people reviewing a risk report on a laptop”.",
      },
    },
    {
      name: "caption",
      type: "text",
      admin: { description: "Optional. Shown under the image when it is used inside an article." },
    },
  ],
};
