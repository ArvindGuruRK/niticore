import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";

/** Marketing pages: the nav and footer persist across client-side navigation between them. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
