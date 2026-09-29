import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import type { PostSummary } from "@/lib/cms";
import { PostCover } from "./post-cover";
import { PostMeta } from "./post-meta";

/**
 * The newest post, above the grid on page 1: a bezel-framed panel with the cover beside the text
 * from lg (stacked on phones and tablets). No label above the title (house style); the size and
 * position say it is the latest, and the heading outline says so for screen readers.
 */
export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <section aria-labelledby="featured-post-heading">
      <h2 id="featured-post-heading" className="sr-only">
        Latest
      </h2>
      <div className="bezel">
        <Link
          href={post.href}
          className="group grid grid-cols-1 overflow-hidden rounded-panel border border-line bg-surface lg:grid-cols-2"
        >
          <PostCover
            image={post.cover}
            sizes="(min-width: 1024px) 40rem, 100vw"
            priority
            zoomOnHover
            className="aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]"
          />
          <div className="flex flex-col justify-center gap-5 p-card sm:p-8 lg:p-10">
            <h3 className="type-h2 text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)] text-fg">{post.title}</h3>
            <p className="type-body line-clamp-4">{post.excerpt}</p>
            <PostMeta author={post.author} publishedAt={post.publishedAt} />
            <span className="type-small inline-flex items-center gap-2 font-semibold text-fg">
              Read the full story
              <ArrowRight
                aria-hidden
                weight="bold"
                className="size-4 text-accent transition-transform duration-300 ease-out-expo group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
