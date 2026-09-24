import { PageHero } from "@/components/page/page-hero";
import { GetStarted } from "@/components/sections/get-started";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Solutions",
  "AI governance for industries where AI errors carry real financial, legal or human consequences, with a view for every stakeholder.",
);

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        title={
          <>
            High-stakes AI demands <span className="text-accent">high-rigour <span data-accent="" className="inline-block">governance.</span></span>
          </>
        }
        lead="Built for industries where AI errors carry real financial, legal or human consequences. The regulations differ by sector. The job is the same: govern every system, continuously, and prove it."
        doodles={{ left: "petal", right: "zigzag" }}
      />
      <GetStarted
        title="Ready to govern AI with confidence?"
        lead="Build the capability. Operationalise the governance. Accelerate the innovation."
      />
    </>
  );
}
