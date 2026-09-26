import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Search engines and AI crawlers named explicitly, so the intent is unambiguous: we want to be found,
 * read, cited and answered from. A named group replaces the "*" group for that crawler, so each one
 * carries the same disallow list. Only the internal design-system showcase is kept out.
 */
const CRAWLERS = [
  // Search
  "Googlebot",
  "Bingbot",
  "Applebot",
  "DuckDuckBot",
  // AI search, assistants and training
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
  "CCBot",
];

const DISALLOW = ["/design-system"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: CRAWLERS, allow: "/", disallow: DISALLOW },
      { userAgent: "*", allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
