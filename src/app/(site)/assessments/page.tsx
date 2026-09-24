import { PageHero } from "@/components/page/page-hero";
import { GetStarted } from "@/components/sections/get-started";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Assessments",
  "Six focused AI governance assessments and a 0 to 100 Governance Readiness score, starting with a free 10-minute diagnostic.",
);

export default function AssessmentsPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Know your risks <span className="text-accent">before they become <span data-accent="" className="inline-block">problems.</span></span>
          </>
        }
        lead="Six focused assessments give you an honest picture of where your AI governance stands, and a clear path to where it needs to be. Start with a free 10-minute readiness score."
        doodles={{ left: "zigzag", right: "petal" }}
      />
      <GetStarted
        title="Find out where you stand in 10 minutes."
        lead="Get your Governance Readiness score, a breakdown across six dimensions, and an executive roadmap you can act on this quarter."
        primary={{ label: "Take the free assessment", href: "#readiness" }}
        secondary={{ label: "Book a demo", href: "#demo" }}
      />
    </>
  );
}
