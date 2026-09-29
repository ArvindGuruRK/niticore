import type { CollectionConfig } from "payload";
import { signedIn } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

/** Bylines for blog and news posts, with the "about the author" card shown under each article. */
export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: "Author", plural: "Authors" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "updatedAt"],
    group: "Content",
    description: "The people shown as the writer of a post.",
  },
  access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "text",
      admin: { description: "Job title, for example “Head of AI Governance”." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "A square head-and-shoulders photo works best." },
    },
    {
      name: "bio",
      type: "textarea",
      maxLength: 320,
      admin: { description: "One or two sentences, shown in the card under each article." },
    },
    {
      type: "row",
      fields: [
        { name: "linkedin", label: "LinkedIn URL", type: "text", validate: httpsUrl },
        { name: "x", label: "X URL", type: "text", validate: httpsUrl },
      ],
    },
  ],
};

function httpsUrl(value: string | null | undefined) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:" || "Use a full https:// address.";
  } catch {
    return "Use a full https:// address.";
  }
}
