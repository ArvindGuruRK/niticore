import { PageHero } from "@/components/page/page-hero";
import { GetStarted } from "@/components/sections/get-started";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Academy & Advisory",
  "AI governance masterclasses for boards, operators and builders, and expert-led advisory that configures governance straight into Niticore.",
);

export default function AcademyAdvisoryPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Don&apos;t just use AI. <span className="text-accent">Understand how to <span data-accent="" className="inline-block">govern</span> it.</span>
          </>
        }
        lead="Masterclass programmes for boards, operators and builders, plus certified practitioners who design your governance and configure it directly into Niticore."
        doodles={{ left: "star", right: "petal" }}
      />
      <GetStarted
        title="We don't just help you comply. We help you build the capability."
        lead="Talk to a governance expert about what your organisation needs to move from documentation to durable governance."
        primary={{ label: "Talk to an expert", href: "/demo" }}
      />
    </>
  );
}
