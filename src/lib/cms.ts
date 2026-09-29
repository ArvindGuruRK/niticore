import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { cache } from "react";
import type { Author, Blog, Media, News } from "@/payload-types";
import { POSTS_PER_PAGE, RELATED_COUNT, SECTIONS, type SectionKey } from "./posts";

/**
 * Server-side reads of blog and news posts, through Payload's Local API (a direct database query,
 * no HTTP). Only published posts are returned unless a draft is asked for (preview mode).
 *
 * Until DATABASE_URL and PAYLOAD_SECRET are set, the CMS is off: every list is empty and the pages
 * show their empty state, so the rest of the site builds and runs without a database.
 */
export const cmsEnabled = Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);

export type PostDoc = Blog | News;

/** What a card needs: the post without its body */
export type PostSummary = {
  id: number;
  section: SectionKey;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  href: string;
  cover: Media | null;
  author: Author | null;
};

const PUBLISHED: Where = { _status: { equals: "published" } };

/** Card fields only, so lists never load article bodies */
const SUMMARY_SELECT = {
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  coverImage: true,
  author: true,
} as const;

const client = () => getPayload({ config });

/** A populated upload or relationship, or null when it is only an id (or missing) */
export const populated = <T extends object>(value: number | T | null | undefined): T | null =>
  value && typeof value === "object" ? value : null;

export const toSummary = (section: SectionKey, doc: Pick<PostDoc, keyof typeof SUMMARY_SELECT | "id">): PostSummary => ({
  id: doc.id,
  section,
  title: doc.title,
  slug: doc.slug,
  excerpt: doc.excerpt,
  publishedAt: doc.publishedAt,
  href: `${SECTIONS[section].path}/${doc.slug}`,
  cover: populated(doc.coverImage),
  author: populated(doc.author),
});

/**
 * One page of a section's list. Page 1 leads with the newest post as the featured card; the grid
 * then pages through every other post, so the featured post never appears twice.
 */
export const getPostList = cache(async (section: SectionKey, page = 1) => {
  const empty = { featured: null, posts: [] as PostSummary[], page, totalPages: 0 };
  if (!cmsEnabled) return empty;

  const payload = await client();
  const collection = SECTIONS[section].collection;

  const latest = await payload.find({
    collection,
    where: PUBLISHED,
    sort: "-publishedAt",
    limit: 1,
    depth: 2,
    select: SUMMARY_SELECT,
  });
  const featured = latest.docs[0];
  if (!featured) return empty;

  const rest = await payload.find({
    collection,
    where: { and: [PUBLISHED, { id: { not_equals: featured.id } }] },
    sort: "-publishedAt",
    limit: POSTS_PER_PAGE,
    page,
    depth: 2,
    select: SUMMARY_SELECT,
  });

  return {
    featured: page === 1 ? toSummary(section, featured) : null,
    posts: rest.docs.map((doc) => toSummary(section, doc)),
    page,
    // At least one page, even when the featured post is the only one
    totalPages: Math.max(1, rest.totalPages),
  };
});

/** A full post by its slug; with `draft`, the latest saved version even if unpublished */
export const getPost = cache(async (section: SectionKey, slug: string, draft = false): Promise<PostDoc | null> => {
  if (!cmsEnabled) return null;
  const payload = await client();
  const result = await payload.find({
    collection: SECTIONS[section].collection,
    where: draft ? { slug: { equals: slug } } : { and: [PUBLISHED, { slug: { equals: slug } }] },
    draft,
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
});

/**
 * Posts for "Related": the ones the writer picked (published only), topped up with the newest
 * others so the row is always full when there are enough posts.
 */
export const getRelatedPosts = cache(async (section: SectionKey, post: PostDoc): Promise<PostSummary[]> => {
  if (!cmsEnabled) return [];
  const pickedIds = (post.relatedPosts ?? [])
    .map((related) => (typeof related === "object" ? related.id : related))
    .filter((id) => id !== post.id);

  const payload = await client();
  const collection = SECTIONS[section].collection;
  const picked = pickedIds.length
    ? await payload.find({
        collection,
        where: { and: [PUBLISHED, { id: { in: pickedIds } }] },
        limit: RELATED_COUNT,
        depth: 2,
        select: SUMMARY_SELECT,
      })
    : null;
  // Keep the writer's order
  const chosen = (picked?.docs ?? []).sort((a, b) => pickedIds.indexOf(a.id) - pickedIds.indexOf(b.id));

  const missing = RELATED_COUNT - chosen.length;
  const latest =
    missing > 0
      ? await payload.find({
          collection,
          where: { and: [PUBLISHED, { id: { not_in: [post.id, ...chosen.map((doc) => doc.id)] } }] },
          sort: "-publishedAt",
          limit: missing,
          depth: 2,
          select: SUMMARY_SELECT,
        })
      : null;

  return [...chosen, ...(latest?.docs ?? [])].map((doc) => toSummary(section, doc));
});

/** Every published post's address and last change: static pages at build, and the sitemap */
export const getPublishedSlugs = cache(async (section: SectionKey) => {
  if (!cmsEnabled) return [];
  const payload = await client();
  const result = await payload.find({
    collection: SECTIONS[section].collection,
    where: PUBLISHED,
    sort: "-publishedAt",
    pagination: false,
    depth: 0,
    select: { slug: true, title: true, excerpt: true, updatedAt: true },
  });
  return result.docs.map(({ slug, title, excerpt, updatedAt }) => ({ slug, title, excerpt, updatedAt }));
});
