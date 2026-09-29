import { Sparkle as SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { Sparkle } from "@/components/illustrations/sparkle";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Container } from "@/components/ui/container";
import type { PostSummary } from "@/lib/cms";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import { FeaturedPost } from "./featured-post";
import { Pagination } from "./pagination";
import { PostCard } from "./post-card";

/**
 * The Blog and News list pages, after the Postiz blog: the page hero, the newest post as a wide
 * featured panel, then "All posts" as a three-column grid of cards with numbered pages under it.
 * Page 2 onwards drops the hero and the featured post for a short heading with the page number.
 */
export function PostIndex({
  section: key,
  featured,
  posts,
  page,
  totalPages,
}: {
  section: SectionKey;
  featured: PostSummary | null;
  posts: PostSummary[];
  page: number;
  totalPages: number;
}) {
  const section = SECTIONS[key];
  const empty = !featured && posts.length === 0;

  return (
    <>
      {page === 1 ? (
        <PageHero
          title={
            <>
              {section.hero.before}{" "}
              <span data-accent="" className="inline-block text-accent">
                {section.hero.accent}
              </span>
            </>
          }
          lead={section.hero.lead}
          doodles={section.hero.doodles}
        />
      ) : (
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
          <Container className="pb-12 pt-[calc(9rem+var(--safe-top))] sm:pb-16 sm:pt-44">
            <div className="flex flex-col items-center gap-5 text-center">
              <Sparkle size={48} trigger="load" delay={0.3} className="text-tertiary" />
              <SplitHeading as="h1" by="words" trigger="load" className="type-hero text-fg">
                {section.listHeading}
              </SplitHeading>
              <Reveal delay={0.3}>
                <p className="type-lead">
                  Page {page} of {totalPages}
                </p>
              </Reveal>
            </div>
          </Container>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
          />
        </section>
      )}

      <Container className="flex flex-col gap-16 pb-section sm:gap-20">
        {empty ? (
          <Reveal>
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-panel border border-line bg-surface p-card text-center shadow-panel sm:p-10">
              <SparkleIcon aria-hidden weight="duotone" className="size-8 text-tertiary" />
              <p className="type-h3 text-fg">Nothing here yet</p>
              <p className="type-body">{section.empty}</p>
            </div>
          </Reveal>
        ) : (
          <>
            {featured && (
              <Reveal>
                <FeaturedPost post={featured} />
              </Reveal>
            )}

            {posts.length > 0 && (
              <section aria-labelledby="all-posts-heading" className="flex flex-col gap-8 sm:gap-10">
                {page === 1 && <SectionHeader id="all-posts-heading" title={section.listHeading} align="left" />}
                {page > 1 && (
                  <h2 id="all-posts-heading" className="sr-only">
                    {section.listHeading}, page {page}
                  </h2>
                )}
                <Reveal stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </Reveal>
              </section>
            )}

            <Pagination basePath={section.path} page={page} totalPages={totalPages} />
          </>
        )}
      </Container>

      <GetStarted />
    </>
  );
}
