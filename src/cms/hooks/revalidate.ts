import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { SECTIONS } from "@/lib/posts";

/**
 * The blog and news pages are built once and served from the cache. Any change to a post, an
 * author or an image rebuilds both sections (lists, articles, related posts) and the sitemap on the
 * next visit, so a published change is live straight away. It is a small site, so rebuilding both
 * is cheaper than working out exactly which pages a change touches.
 *
 * Outside a Next.js request (the payload CLI, a migration) there is no cache to clear, and
 * revalidatePath throws; that case is skipped.
 */
function revalidateContent() {
  try {
    for (const section of Object.values(SECTIONS)) revalidatePath(section.path, "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");
  } catch {
    // Not inside a Next.js request
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc, context }) => {
  // Autosaved drafts of a post that isn't live change nothing visitors see. Publishing,
  // unpublishing, and every save of an author or image (no drafts) do.
  const draftOnly = doc?._status === "draft" && previousDoc?._status !== "published";
  if (!context.skipRevalidate && !draftOnly) revalidateContent();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (!context.skipRevalidate) revalidateContent();
  return doc;
};
