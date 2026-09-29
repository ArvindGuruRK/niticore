import { ArticlePage, articleMetadata, articleParams } from "@/components/posts/routes";

type Props = PageProps<"/news/[slug]">;

export const revalidate = 3600;

// Every published post is built ahead; new ones render on first visit, then stay cached
export const generateStaticParams = () => articleParams("news");

export const generateMetadata = (props: Props) => articleMetadata("news", props);

export default function NewsArticlePage(props: Props) {
  return <ArticlePage section="news" {...props} />;
}
