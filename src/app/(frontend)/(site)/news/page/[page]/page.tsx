import { ListPage, listPageMetadata, listPageParams } from "@/components/posts/routes";

type Props = PageProps<"/news/page/[page]">;

export const revalidate = 3600;

export const generateStaticParams = () => listPageParams("news");

export const generateMetadata = (props: Props) => listPageMetadata("news", props);

export default function NewsListPage(props: Props) {
  return <ListPage section="news" {...props} />;
}
