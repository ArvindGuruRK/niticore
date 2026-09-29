import { IndexPage, indexMetadata } from "@/components/posts/routes";

export const metadata = indexMetadata("blog");

// Rebuilt the moment a post is published (see cms/hooks/revalidate.ts); hourly as a fallback
export const revalidate = 3600;

export default function BlogPage() {
  return <IndexPage section="blog" />;
}
