import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { LegalToc } from "@/components/legal/legal-toc";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { populated, type PostDoc, type PostSummary } from "@/lib/cms";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import type { Author, Media } from "@/payload-types";
import { PostCard } from "./post-card";
import { PostCover } from "./post-cover";
import { AuthorAvatar, PostMeta } from "./post-meta";
import { ArticleBody, articleParts } from "./rich-text";

const BODY_ID = "article-body";

/**
 * A blog or news article, after the Postiz article page: a back link, the title and byline on the
 * grid canvas, then the cover and the text with a sticky side column from lg ("On this page",
 * tracking the h2 being read, and a Book a demo card). It closes with the author card, related
 * posts and the standard Get started CTA. Below lg the side column is just the collapsed
 * "On this page" panel between the cover and the text.
 */
export function PostArticle({ section: key, post, related }: { section: SectionKey; post: PostDoc; related: PostSummary[] }) {
  const section = SECTIONS[key];
  const author = populated<Author>(post.author);
  const cover = populated<Media>(post.coverImage);
  const { parts, toc } = articleParts(post.content as unknown as SerializedEditorState);
  const showToc = toc.length >= 2;

  return (
    <>
      <article>
        <header className="relative isolate overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
          <Container className="pb-10 pt-[calc(8.5rem+var(--safe-top))] sm:pb-14 sm:pt-40">
            <div className="flex max-w-4xl flex-col items-start gap-6">
              <Reveal>
                <Link
                  href={section.path}
                  className="group type-small inline-flex min-h-[var(--spacing-tap)] items-center gap-2 font-semibold text-fg-muted transition-colors hover:text-fg"
                >
                  <ArrowLeft
                    aria-hidden
                    weight="bold"
                    className="size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-x-1 motion-reduce:transition-none"
                  />
                  {section.back}
                </Link>
              </Reveal>
              <SplitHeading as="h1" by="words" trigger="load" delay={0.1} className="type-hero text-fg">
                {post.title}
              </SplitHeading>
              <Reveal delay={0.3}>
                <PostMeta author={author} publishedAt={post.publishedAt} size="lg" />
              </Reveal>
            </div>
          </Container>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
          />
        </header>

        <Container className="pb-section">
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-x-20">
            <Reveal className="lg:col-start-1 lg:row-start-1">
              <div className="bezel">
                <PostCover image={cover} sizes="(min-width: 1280px) 52rem, (min-width: 1024px) 64vw, 100vw" priority className="aspect-[16/9] rounded-panel" />
              </div>
            </Reveal>

            <aside
              aria-label="About this article"
              className={`lg:col-start-2 lg:row-span-2 lg:row-start-1 ${showToc ? "" : "hidden lg:block"}`}
            >
              <div className="flex flex-col gap-8 lg:sticky lg:top-32">
                {showToc && <LegalToc items={toc} articleId={BODY_ID} />}
                <DemoCard />
              </div>
            </aside>

            <div className="flex min-w-0 max-w-3xl flex-col gap-14 lg:col-start-1 lg:row-start-2">
              <ArticleBody id={BODY_ID} parts={parts} />
              {author && <AuthorCard author={author} />}
            </div>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="pb-section">
          <Container className="flex flex-col gap-10">
            <SectionHeader id="related-heading" title={key === "blog" ? "Related posts" : "More news"} />
            <Reveal stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      <GetStarted />
    </>
  );
}

/** Sidebar card from lg. Copy from the site's own CTAs (the Get started lead and the demo ribbon). */
function DemoCard() {
  return (
    <div className="card-violet hidden flex-col items-start gap-4 rounded-panel border border-white/10 p-card shadow-panel lg:flex">
      <p className="type-h4 text-fg">See AI governance in action</p>
      <p className="type-small text-fg/85">Wherever you are on the governance journey, we provide an immediate path forward.</p>
      <Button href="/demo" size="md" arrow>
        Book a demo
      </Button>
    </div>
  );
}

/** Who wrote it: photo, name, role, bio and profile links */
function AuthorCard({ author }: { author: Author }) {
  const links = [
    author.linkedin && { href: author.linkedin, label: "LinkedIn", Icon: LinkedinLogo },
    author.x && { href: author.x, label: "X", Icon: XLogo },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof XLogo }[];

  return (
    <Reveal>
      <section
        aria-label="About the author"
        className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-card shadow-panel sm:flex-row sm:items-start sm:gap-6 sm:p-8"
      >
        <AuthorAvatar author={author} size={72} />
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="type-h3 text-fg">{author.name}</p>
            {links.length > 0 && (
              <ul className="flex items-center gap-1.5">
                {links.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${author.name} on ${label} (opens in a new tab)`}
                      className="grid size-11 place-items-center rounded-control border border-line-strong text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
                    >
                      <Icon aria-hidden weight="fill" className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {author.role && <p className="type-small">{author.role}</p>}
          {author.bio && <p className="type-body mt-1">{author.bio}</p>}
        </div>
      </section>
    </Reveal>
  );
}
