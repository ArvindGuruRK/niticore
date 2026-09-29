import Image from "next/image";
import type { Author, Media } from "@/payload-types";
import { formatPostDate } from "@/lib/posts";
import { cn } from "@/lib/utils";

/** An author's photo, or their initials in a violet ring when there is none */
export function AuthorAvatar({ author, size, className }: { author: Author | null; size: number; className?: string }) {
  const photo = author?.photo && typeof author.photo === "object" ? (author.photo as Media) : null;
  if (photo?.url) {
    return (
      <Image
        src={photo.url}
        alt=""
        width={size}
        height={size}
        sizes={`${size * 2}px`}
        style={{ objectPosition: `${photo.focalX ?? 50}% ${photo.focalY ?? 50}%` }}
        className={cn("shrink-0 rounded-full border border-line-strong object-cover", className)}
      />
    );
  }
  const initials = (author?.name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-tertiary/40 bg-raised font-display font-semibold text-tertiary",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Byline: avatar, name, a hairline, the date. Used on cards, the featured post and the article. */
export function PostMeta({
  author,
  publishedAt,
  size = "sm",
  className,
}: {
  author: Author | null;
  publishedAt: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const large = size === "lg";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", large ? "type-body" : "type-small", className)}>
      {author && (
        <>
          <span className="flex items-center gap-2.5">
            <AuthorAvatar author={author} size={large ? 40 : 28} />
            <span className="font-semibold text-fg">{author.name}</span>
          </span>
          <span aria-hidden className={cn("w-px bg-line-strong", large ? "h-5" : "h-4")} />
        </>
      )}
      <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>
    </div>
  );
}
