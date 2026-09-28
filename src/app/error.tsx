"use client";

import { useEffect } from "react";
import { PageDoodles } from "@/components/page/page-doodles";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

/**
 * Shown when a page throws while rendering, in place of Next's plain default. Same flat canvas, grid
 * and edge doodles as the 404 page. The nav stays so people can move on; the footer is left out, so
 * a fault in shared page chrome can't take this page down with it.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <title>Something went wrong | Niticore</title>
      <SiteNav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
          <PageDoodles left="petal" right="zigzag" />
          <div className="px-page">
            <div className="mx-auto flex min-h-[92svh] max-w-7xl items-center justify-center pb-section pt-[calc(8rem+var(--safe-top))] sm:pt-36">
              <div className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
                <h1 className="type-hero text-fg">
                  Something <span className="text-accent">went wrong</span>
                </h1>
                <p className="type-lead">
                  This page ran into a problem. Please try again, or head back to the home page.
                </p>
                <div className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row">
                  <Button size="lg" onClick={reset}>
                    Try again
                  </Button>
                  <Button size="lg" variant="secondary" href="/">
                    Go to the home page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
