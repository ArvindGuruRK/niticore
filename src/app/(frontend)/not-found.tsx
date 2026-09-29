import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
  // Don't inherit the home page's canonical URL from the root layout
  alternates: { canonical: null },
};

/** A page inside the site that doesn't exist, such as an unknown or unpublished post */
export default function NotFound() {
  return <NotFoundView />;
}
