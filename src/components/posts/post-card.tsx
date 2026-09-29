import Link from "next/link";
import type { PostSummary } from "@/lib/cms";
import { PostCover } from "./post-cover";
import { PostMeta } from "./post-meta";

/**
 * A post in a grid: cover on top, then the title, the byline and the excerpt. The whole card is one
 * link; on hover the border lifts and the cover zooms slowly. Titles and excerpts are clamped so
 * every card in a row lines up.
 */
export function PostCard({ post, headingLevel = "h3" }: { post: PostSummary; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <Link
      href={post.href}
      className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-panel transition-colors duration-300 hover:border-line-strong focus-visible:border-line-strong"
    >
      <PostCover image={post.cover} sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw" zoomOnHover className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-4 p-card">
        <Heading className="type-h4 line-clamp-2 text-fg">{post.title}</Heading>
        <PostMeta author={post.author} publishedAt={post.publishedAt} />
        <p className="type-small line-clamp-3">{post.excerpt}</p>
      </div>
    </Link>
  );
}
