import Image from "next/image";
import type { DefaultNodeTypes, SerializedBlockNode, SerializedHeadingNode, SerializedLinkNode } from "@payloadcms/richtext-lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "@payloadcms/richtext-lexical/lexical";
import { LinkJSXConverter, RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { TocItem } from "@/components/legal/legal-toc";
import type { Media } from "@/payload-types";
import { SECTIONS, type SectionKey } from "@/lib/posts";

type CodeBlockFields = { blockType: "Code"; code?: string; language?: string };
type Nodes = DefaultNodeTypes | SerializedBlockNode<CodeBlockFields>;

/** A link to another blog or news post points at that post's page */
function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }) {
  const { relationTo, value } = linkNode.fields.doc ?? {};
  const slug = value && typeof value === "object" && "slug" in value ? value.slug : null;
  const section = SECTIONS[relationTo as SectionKey];
  return section && typeof slug === "string" ? `${section.path}/${slug}` : "#";
}

const converters: JSXConvertersFunction<Nodes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  // Images: optimised through next/image, with the caption set here or on the image itself
  upload: ({ node }) => {
    const media = node.value as Media | number;
    if (typeof media !== "object" || !media.url || !media.mimeType?.startsWith("image/")) return null;
    const caption = (node.fields as { caption?: string } | undefined)?.caption || media.caption;
    return (
      <figure>
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width ?? 1600}
          height={media.height ?? 900}
          sizes="(min-width: 1024px) 48rem, 100vw"
        />
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  },
  blocks: {
    Code: ({ node }) => (
      <pre data-language={node.fields.language || undefined}>
        <code>{node.fields.code}</code>
      </pre>
    ),
  },
  // Tables: the design system styles them (no inline borders), and wide ones scroll in place
  table: ({ node, nodesToJSX }) => (
    <div className="table-scroll">
      <table>
        <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
      </table>
    </div>
  ),
  tablerow: ({ node, nodesToJSX }) => <tr>{nodesToJSX({ nodes: node.children })}</tr>,
  tablecell: ({ node, nodesToJSX }) => {
    const Cell = node.headerState > 0 ? "th" : "td";
    return (
      <Cell colSpan={node.colSpan && node.colSpan > 1 ? node.colSpan : undefined} rowSpan={node.rowSpan && node.rowSpan > 1 ? node.rowSpan : undefined}>
        {nodesToJSX({ nodes: node.children })}
      </Cell>
    );
  },
});

/** The plain text inside a node, e.g. a heading's words */
function textOf(node: SerializedLexicalNode): string {
  if ("text" in node && typeof node.text === "string") return node.text;
  if ("children" in node && Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

/** "What the EU AI Act asks for" → "what-the-eu-ai-act-asks-for", made unique within the article */
function anchorFor(text: string, used: Set<string>) {
  const base =
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "section";
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

type Part = { id: string | null; title: string | null; nodes: SerializedLexicalNode[] };

/**
 * Splits the article at each h2: the text before the first h2, then one part per h2 with everything
 * up to the next. Each part renders as a <section> the "On this page" list can track.
 */
export function articleParts(content: SerializedEditorState) {
  const used = new Set<string>();
  const parts: Part[] = [{ id: null, title: null, nodes: [] }];
  for (const node of content.root.children) {
    if (node.type === "heading" && (node as SerializedHeadingNode).tag === "h2") {
      const title = textOf(node).trim();
      parts.push({ id: anchorFor(title, used), title, nodes: [node] });
    } else {
      parts[parts.length - 1].nodes.push(node);
    }
  }
  const toc: TocItem[] = parts.flatMap((part) => (part.id && part.title ? [{ id: part.id, title: part.title }] : []));
  return { parts: parts.filter((part) => part.nodes.length > 0), toc };
}

/** An article body from the CMS, in the design system's type-article style */
export function ArticleBody({ id, parts }: { id: string; parts: Part[] }) {
  return (
    <div id={id} className="type-article">
      {parts.map((part, i) => {
        const data = { root: { type: "root", format: "", indent: 0, version: 1, direction: null, children: part.nodes } } as SerializedEditorState;
        const body = <RichText data={data} converters={converters} disableContainer disableIndent disableTextAlign />;
        return part.id ? (
          <section key={part.id} id={part.id} className="scroll-mt-32">
            {body}
          </section>
        ) : (
          <section key={`intro-${i}`}>{body}</section>
        );
      })}
    </div>
  );
}
