import { slugField, type CollectionConfig, type TextFieldSingleValidation } from "payload";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import { signedIn } from "../access";
import { articleEditor } from "../editor";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

/** Lowercase words joined by single hyphens, e.g. "eu-ai-act-explained" */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "page" would clash with the list's /blog/page/2 addresses */
const validateSlug: TextFieldSingleValidation = (value) => {
  if (!value) return "Required.";
  if (!SLUG_PATTERN.test(value)) return "Use lowercase letters, numbers and single hyphens only.";
  if (value === "page") return "“page” is reserved. Choose another slug.";
  return true;
};

/**
 * One schema for both Blog and News, so they share an editor, a card and an article page but stay
 * separate tabs in the admin. Drafts are saved as you type (autosave); visitors only ever see the
 * published version. "Preview" opens the draft on the real page.
 */
function postCollection(key: SectionKey, labels: { singular: string; plural: string }): CollectionConfig {
  const section = SECTIONS[key];
  return {
    slug: section.collection,
    labels,
    admin: {
      useAsTitle: "title",
      defaultColumns: ["title", "author", "publishedAt", "_status"],
      listSearchableFields: ["title", "excerpt"],
      group: "Content",
      preview: (doc) =>
        typeof doc?.slug === "string"
          ? `/cms-preview?collection=${section.collection}&slug=${encodeURIComponent(doc.slug)}`
          : null,
    },
    defaultSort: "-publishedAt",
    access: { read: signedIn, create: signedIn, update: signedIn, delete: signedIn },
    versions: {
      drafts: { autosave: { interval: 2000 } },
      maxPerDoc: 50,
    },
    hooks: {
      afterChange: [revalidateAfterChange],
      afterDelete: [revalidateAfterDelete],
    },
    fields: [
      { name: "title", type: "text", required: true, maxLength: 160 },
      {
        type: "tabs",
        tabs: [
          {
            label: "Content",
            fields: [
              {
                name: "coverImage",
                label: "Cover image",
                type: "upload",
                relationTo: "media",
                required: true,
                admin: {
                  description:
                    "Shown on the card and at the top of the article. Landscape, at least 1600px wide. Set a focal point so cards crop around the subject.",
                },
              },
              {
                name: "excerpt",
                type: "textarea",
                required: true,
                maxLength: 280,
                admin: {
                  description:
                    "One or two sentences for the card, search results and link previews. Up to 280 characters.",
                },
              },
              { name: "content", type: "richText", required: true, editor: articleEditor },
            ],
          },
          {
            label: "Related",
            fields: [
              {
                name: "relatedPosts",
                label: `Related ${labels.plural.toLowerCase()}`,
                type: "relationship",
                relationTo: section.collection,
                hasMany: true,
                maxRows: 3,
                filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
                admin: {
                  description: `Up to three, shown under the article. Leave empty to show the latest ${labels.plural.toLowerCase()}.`,
                },
              },
            ],
          },
          {
            name: "meta",
            label: "SEO",
            fields: [
              {
                name: "title",
                type: "text",
                maxLength: 70,
                admin: { description: "Optional. Replaces the post title in search results. Up to 70 characters." },
              },
              {
                name: "description",
                type: "textarea",
                maxLength: 160,
                admin: { description: "Optional. Replaces the excerpt in search results. Up to 160 characters." },
              },
              {
                name: "image",
                label: "Social image",
                type: "upload",
                relationTo: "media",
                admin: { description: "Optional. Replaces the cover image when the link is shared." },
              },
            ],
          },
        ],
      },
      slugField({
        overrides: (row) => {
          for (const field of row.fields) {
            if ("name" in field && field.name === "slug" && field.type === "text") {
              field.validate = validateSlug;
              field.admin = {
                ...field.admin,
                description: `The address: ${section.path}/your-slug. Changing it after publishing breaks links already shared.`,
              };
            }
          }
          return row;
        },
      }),
      {
        name: "publishedAt",
        label: "Publish date",
        type: "date",
        required: true,
        defaultValue: () => new Date().toISOString(),
        admin: {
          position: "sidebar",
          date: { pickerAppearance: "dayAndTime", displayFormat: "d MMMM yyyy, HH:mm" },
          description: "Shown on the post. Posts are listed newest first.",
        },
      },
      {
        name: "author",
        type: "relationship",
        relationTo: "authors",
        required: true,
        admin: { position: "sidebar" },
      },
    ],
  };
}

export const Blog = postCollection("blog", { singular: "Blog post", plural: "Blog posts" });
export const News = postCollection("news", { singular: "News item", plural: "News" });
