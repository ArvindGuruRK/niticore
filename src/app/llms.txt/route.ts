import { getPublishedSlugs } from "@/lib/cms";
import { llmsIndex, type LlmsPost } from "@/lib/llms";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

// Built from the site's own content and the published posts; rebuilt whenever a post is
// published (cms/hooks/revalidate.ts), hourly as a fallback
export const dynamic = "force-static";
export const revalidate = 3600;

const posts = async (key: SectionKey): Promise<LlmsPost[]> =>
  (await getPublishedSlugs(key)).map(({ slug, title, excerpt }) => ({
    title,
    url: `${SITE_URL}${SECTIONS[key].path}/${slug}`,
    excerpt,
  }));

/** /llms.txt: a short Markdown map of the site for AI assistants (https://llmstxt.org). */
export async function GET() {
  const [blog, news] = await Promise.all([posts("blog"), posts("news")]);
  return new Response(llmsIndex({ blog, news }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
