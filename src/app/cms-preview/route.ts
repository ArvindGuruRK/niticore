import config from "@payload-config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { SECTIONS, type SectionKey } from "@/lib/posts";

/**
 * The CMS's "Preview" button lands here (see cms/collections/posts.ts). Only a signed-in CMS user
 * may turn on Next.js draft mode, which makes the post pages show the latest saved draft instead
 * of the published version; then this sends them to the post. /cms-preview/exit turns it off.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const section = SECTIONS[params.get("collection") as SectionKey];
  const slug = params.get("slug") ?? "";
  if (!section || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Unknown post.", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Sign in to the CMS at /admin to preview drafts.", { status: 401 });
  }

  (await draftMode()).enable();
  redirect(`${section.path}/${slug}`);
}
