import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  LinkFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

/** Default features the article design has no place for */
const DROPPED = new Set([
  // h1 is the post title, so headings are restricted below
  "heading",
  // Reconfigured below
  "upload",
  "link",
  // Articles are always left-aligned
  "align",
  // Would render nothing on the site
  "relationship",
  "checklist",
  "subscript",
  "superscript",
]);

/**
 * The article editor. Writers get headings (h2 to h4; h2s build the "On this page" list), bold,
 * italic, underline, strikethrough, inline code, lists, quotes, links (to any web page or another
 * blog or news post), images with an optional caption, dividers, tables and code blocks.
 * Everything renders through components/posts/rich-text.tsx in the design system's article type.
 */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => !DROPPED.has(feature.key)),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    LinkFeature({ enabledCollections: ["blog", "news"] }),
    UploadFeature({
      enabledCollections: ["media"],
      collections: {
        media: {
          fields: [
            {
              name: "caption",
              type: "text",
              admin: { description: "Optional. Replaces the image's own caption here." },
            },
          ],
        },
      },
    }),
    BlocksFeature({ blocks: [CodeBlock()] }),
    EXPERIMENTAL_TableFeature(),
    FixedToolbarFeature(),
  ],
});
