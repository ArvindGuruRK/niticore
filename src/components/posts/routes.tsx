import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd, ORG_ID } from "@/components/seo/json-ld";
import { getPost, getPostList, getPublishedSlugs, getRelatedPosts, populated } from "@/lib/cms";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import { pageMetadata, SITE_URL } from "@/lib/site";
import type { Author, Media } from "@/payload-types";
import { PostArticle } from "./post-article";
import { PostIndex } from "./post-index";
import { PreviewBar } from "./preview-bar";

/**
 * Everything the Blog and News routes do, written once. Each route file under app/(frontend)/(site)/
 * blog and news is a few lines that call these with its section.
 */

/** An image's absolute address, for metadata and structured data */
const absolute = (url: string) => (url.startsWith("http") ? url : `${SITE_URL}${url}`);

/* ---------------------------------------------------------------- list, page 1 */

export async function IndexPage({ section }: { section: SectionKey }) {
  const list = await getPostList(section, 1);
  return <PostIndex section={section} {...list} />;
}

export const indexMetadata = (section: SectionKey) => pageMetadata(SECTIONS[section].path);

/* ---------------------------------------------------------------- list, page 2 onwards */

type PageParams = { params: Promise<{ page: string }> };

/** "2" → 2; anything else (including "1", which lives at the section's own address) → null */
const pageNumber = (value: string) => (/^[1-9]\d*$/.test(value) ? Number(value) : null);

export async function listPageParams(section: SectionKey) {
  const { totalPages } = await getPostList(section, 1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function ListPage({ section, params }: { section: SectionKey } & PageParams) {
  const page = pageNumber((await params).page);
  if (page === 1) permanentRedirect(SECTIONS[section].path);
  if (!page) notFound();
  const list = await getPostList(section, page);
  if (page > list.totalPages) notFound();
  return <PostIndex section={section} {...list} />;
}

export async function listPageMetadata(section: SectionKey, { params }: PageParams): Promise<Metadata> {
  const page = pageNumber((await params).page);
  const { path, listHeading, label } = SECTIONS[section];
  const url = `${path}/page/${page}`;
  const title = `${listHeading}, page ${page}`;
  return {
    title: `${title} | ${label}`,
    description: pageMetadata(path).description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${label} | Niticore`, url },
  };
}

/* ---------------------------------------------------------------- article */

type ArticleParams = { params: Promise<{ slug: string }> };

export async function articleParams(section: SectionKey) {
  return (await getPublishedSlugs(section)).map(({ slug }) => ({ slug }));
}

export async function ArticlePage({ section, params }: { section: SectionKey } & ArticleParams) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const post = await getPost(section, decodeURIComponent(slug), draft);
  if (!post) notFound();

  const related = await getRelatedPosts(section, post);
  const { path, schemaType } = SECTIONS[section];
  const url = `${SITE_URL}${path}/${post.slug}`;
  const author = populated<Author>(post.author);
  const cover = populated<Media>(post.coverImage);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": schemaType,
          "@id": `${url}#article`,
          headline: post.title,
          description: post.meta?.description || post.excerpt,
          url,
          mainEntityOfPage: url,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          ...(cover?.url && { image: [absolute(cover.url)] }),
          ...(author && {
            author: {
              "@type": "Person",
              name: author.name,
              ...(author.role && { jobTitle: author.role }),
              ...((author.linkedin || author.x) && { sameAs: [author.linkedin, author.x].filter(Boolean) }),
            },
          }),
          publisher: { "@id": ORG_ID },
          isPartOf: { "@id": `${SITE_URL}/#website` },
          inLanguage: "en",
        }}
      />
      <PostArticle section={section} post={post} related={related} />
      {draft && <PreviewBar path={`${path}/${post.slug}`} status={post._status ?? "draft"} />}
    </>
  );
}

export async function articleMetadata(section: SectionKey, { params }: ArticleParams): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const post = await getPost(section, decodeURIComponent(slug), draft);
  if (!post) return {};

  const { path } = SECTIONS[section];
  const url = `${path}/${post.slug}`;
  const title = post.meta?.title || post.title;
  const description = post.meta?.description || post.excerpt;
  const image = populated<Media>(post.meta?.image) ?? populated<Media>(post.coverImage);
  const author = populated<Author>(post.author);

  return {
    title,
    description,
    alternates: { canonical: url },
    // Drafts are only ever seen in preview, but never let one be indexed
    ...(draft && { robots: { index: false, follow: false } }),
    openGraph: {
      type: "article",
      title: `${title} | Niticore`,
      description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(author && { authors: [author.name] }),
      ...(image?.url && {
        images: [{ url: absolute(image.url), alt: image.alt, width: image.width ?? undefined, height: image.height ?? undefined }],
      }),
    },
  };
}
