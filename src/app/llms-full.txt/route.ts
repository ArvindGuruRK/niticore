import { llmsFull } from "@/lib/llms";

// Built once at build time from the site's own content
export const dynamic = "force-static";

/** /llms-full.txt: every page's content as one Markdown file, for AI assistants to read and cite. */
export function GET() {
  return new Response(llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
