import Image from "next/image";
import type { Media } from "@/payload-types";
import { cn } from "@/lib/utils";

/**
 * A post's cover image, cropped to its frame around the focal point set in the CMS. Without an
 * image (a missing upload) the frame shows the grid canvas, so layouts never collapse.
 */
export function PostCover({
  image,
  sizes,
  priority = false,
  zoomOnHover = false,
  className,
}: {
  image: Media | null;
  sizes: string;
  priority?: boolean;
  /** Slow zoom when the surrounding `group` link is hovered or focused */
  zoomOnHover?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-raised", className)}>
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%` }}
          className={cn(
            "object-cover",
            zoomOnHover &&
              "transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100",
          )}
        />
      ) : (
        <div aria-hidden className="grid-bg absolute inset-0" />
      )}
    </div>
  );
}
