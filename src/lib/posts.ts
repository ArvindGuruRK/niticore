/**
 * The two CMS-driven sections of the site. Each is its own collection in the admin (so "Blog" and
 * "News" are separate tabs there) and its own set of pages here; both share one schema and one
 * page design. Safe to import anywhere: this file doesn't load Payload.
 */
export const SECTIONS = {
  blog: {
    collection: "blog",
    path: "/blog",
    /** Nav label and page name */
    label: "Blog",
    /** "Back to …" link on an article */
    back: "All blog posts",
    /** JSON-LD type for an article */
    schemaType: "BlogPosting",
    /** Heading over the grid, and the h1 of page 2 onwards */
    listHeading: "All posts",
    /** Hero: the title with its key word (green, double underline) and the lead. Topics from the
     *  "Resources: AI Governance Intelligence" section of the website concept (docs/). */
    hero: {
      before: "AI governance",
      accent: "intelligence",
      doodles: { left: "star", right: "zigzag" },
      lead: "Guides, research and perspectives on AI regulation, responsible AI, AI risk and agentic AI.",
    },
    empty: "The first posts are on their way. Check back soon.",
  },
  news: {
    collection: "news",
    path: "/news",
    label: "News",
    back: "All news",
    schemaType: "NewsArticle",
    listHeading: "All news",
    hero: {
      before: "The latest from",
      accent: "Niticore",
      doodles: { left: "petal", right: "star" },
      lead: "Announcements, product updates and events from the Niticore team.",
    },
    empty: "News from the team will appear here. Check back soon.",
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;
export type Section = (typeof SECTIONS)[SectionKey];

/** Cards per page in the "All posts" grid: three rows of three on desktop */
export const POSTS_PER_PAGE = 9;

/** How many posts "Related posts" shows under an article */
export const RELATED_COUNT = 3;

/**
 * Post dates are read on the calendar of the Dubai hub (the first in COMPANY.hubs), so a post
 * published just after midnight there never shows the day before, whatever the server's clock.
 */
const POST_TIME_ZONE = "Asia/Dubai";

/** A post's date as "24 September 2026", the house date style */
export const formatPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: POST_TIME_ZONE,
  });
