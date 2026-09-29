import { FeaturedPost } from "@/components/posts/featured-post";
import { Pagination } from "@/components/posts/pagination";
import { PostCard } from "@/components/posts/post-card";
import type { PostSummary } from "@/lib/cms";
import type { Author, Media } from "@/payload-types";

/** Sample content for the showcase only; on the site these come from the CMS */
const STAMP = "2026-09-01T09:00:00.000Z";

const AUTHOR: Author = { id: 0, name: "Sample Author", role: "Role", updatedAt: STAMP, createdAt: STAMP };

const PHOTO: Media = {
  id: 0,
  alt: "People working together at a table with laptops",
  url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&h=900&fit=crop&auto=format",
  width: 1200,
  height: 900,
  updatedAt: STAMP,
  createdAt: STAMP,
};

const post = (id: number, title: string, cover: Media | null): PostSummary => ({
  id,
  section: "blog",
  title,
  slug: "sample",
  excerpt: "The excerpt from the CMS: one or two sentences for the card, search results and link previews.",
  publishedAt: STAMP,
  href: "/design-system",
  cover,
  author: AUTHOR,
});

export function PostsDemo() {
  return (
    <div className="flex flex-col gap-10">
      <FeaturedPost post={post(1, "Featured post: the newest post, above the grid on page 1", PHOTO)} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PostCard post={post(2, "A post card with its cover image", PHOTO)} />
        <PostCard post={post(3, "Without a cover, the frame shows the grid canvas instead", null)} />
        <PostCard post={post(4, "Long titles are clamped to two lines so every card in a row lines up neatly", PHOTO)} />
      </div>
      <Pagination basePath="/design-system" page={2} totalPages={6} />
    </div>
  );
}

/** type-article with plain markup, as the CMS renderer produces it */
export function ArticleTypeDemo() {
  return (
    <div className="type-article max-w-3xl">
      <p>
        Article text reads at 17 to 18px with generous leading, <strong>bold in full white</strong>, links{" "}
        <a href="/design-system">underlined in violet</a>, and <code>inline code</code> on a raised chip.
      </p>
      <h2>An h2 starts a section</h2>
      <p>Each h2 becomes an entry in the article&apos;s On this page list.</p>
      <ol>
        <li>Numbered lists use tabular numerals in a neutral tone.</li>
        <li>Bulleted lists use the same small round bullet as type-prose.</li>
      </ol>
      <blockquote>Quotes sit in the display face with a violet rule.</blockquote>
      <pre>
        <code>{"// Code blocks: mono type on a surface panel\nconst governed = true;"}</code>
      </pre>
      <div className="table-scroll">
        <table>
          <tbody>
            <tr>
              <th>Column</th>
              <th>Column</th>
            </tr>
            <tr>
              <td>Tables scroll sideways on phones</td>
              <td>Hairlines between rows only</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
