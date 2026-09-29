import { IndexPage, indexMetadata } from "@/components/posts/routes";

export const metadata = indexMetadata("news");

// Rebuilt the moment a post is published (see cms/hooks/revalidate.ts); hourly as a fallback
export const revalidate = 3600;

export default function NewsPage() {
  return <IndexPage section="news" />;
}
