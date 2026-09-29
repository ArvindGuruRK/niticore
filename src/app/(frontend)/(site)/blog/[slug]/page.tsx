import { ArticlePage, articleMetadata, articleParams } from "@/components/posts/routes";

type Props = PageProps<"/blog/[slug]">;

export const revalidate = 3600;

// Every published post is built ahead; new ones render on first visit, then stay cached
export const generateStaticParams = () => articleParams("blog");

export const generateMetadata = (props: Props) => articleMetadata("blog", props);

export default function BlogArticlePage(props: Props) {
  return <ArticlePage section="blog" {...props} />;
}
