import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Annotate } from "@/components/illustrations/annotate";
import { LostCompass } from "@/components/illustrations/lost-compass";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { PageDoodles } from "@/components/page/page-doodles";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
  // Don't inherit the home page's canonical URL from the root layout
  alternates: { canonical: null },
};

/**
 * Every unknown address lands here. It sits outside the (site) group, so it brings its own nav and
 * footer. Same flat canvas, grid and edge doodles as the inner-page heroes; the zero of "404" is a
 * lost compass that hunts for north (and follows the cursor on desktop).
 */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
          <PageDoodles left="zigzag" right="star" />

          <div className="px-page">
            <div className="mx-auto flex min-h-[92svh] max-w-7xl items-center justify-center pb-section pt-[calc(8rem+var(--safe-top))] sm:pt-36">
              <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
                <p className="sr-only">Error 404</p>
                <Reveal stagger aria-hidden className="type-numeral flex items-baseline text-fg">
                  <span>4</span>
                  <LostCompass delay={0.5} className="ml-[0.09em] mr-[0.02em] h-[0.75em] w-auto text-tertiary" />
                  <span>4</span>
                </Reveal>

                <Annotate target="[data-accent]" variant="double" delay={1.1} className="w-full">
                  <SplitHeading as="h1" by="words" trigger="load" delay={0.4} className="type-hero text-fg">
                    Page{" "}
                    <span data-accent="" className="inline-block text-accent">
                      not found
                    </span>
                  </SplitHeading>
                </Annotate>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
