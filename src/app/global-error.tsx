"use client";

import "./globals.css";

/**
 * Last resort, when the root layout itself fails: it replaces the whole document, so it brings its
 * own <html> and <body> and uses no shared components. Plain markup in the design-system classes.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center px-page">
        <title>Something went wrong | Niticore</title>
        <main className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="type-hero text-fg">
            Something <span className="text-accent">went wrong</span>
          </h1>
          <p className="type-lead">The site ran into a problem. Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-control bg-accent px-6 text-[0.9375rem] font-semibold text-accent-ink shadow-accent transition-colors hover:bg-accent-hover"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
