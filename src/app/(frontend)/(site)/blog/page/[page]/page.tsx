import { ListPage, listPageMetadata, listPageParams } from "@/components/posts/routes";

type Props = PageProps<"/blog/page/[page]">;

export const revalidate = 3600;

export const generateStaticParams = () => listPageParams("blog");

export const generateMetadata = (props: Props) => listPageMetadata("blog", props);

export default function BlogListPage(props: Props) {
  return <ListPage section="blog" {...props} />;
}
