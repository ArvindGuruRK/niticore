import { llmsIndex } from "@/lib/llms";

// Built once at build time from the site's own content
export const dynamic = "force-static";

/** /llms.txt: a short Markdown map of the site for AI assistants (https://llmstxt.org). */
export function GET() {
  return new Response(llmsIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
