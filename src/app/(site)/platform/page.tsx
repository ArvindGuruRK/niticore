import { PageHero } from "@/components/page/page-hero";
import { AgentRun } from "@/components/platform/agent-run";
import { Cockpit } from "@/components/platform/cockpit";
import { FiveQuestions } from "@/components/platform/five-questions";
import { Lifecycle } from "@/components/platform/lifecycle";
import { Pillars } from "@/components/platform/pillars";
import { GetStarted } from "@/components/sections/get-started";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Platform",
  "One place to know, govern and prove that every AI system in your organisation is under control.",
);

export default function PlatformPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Your AI governance <span className="text-accent">control <span data-accent="" className="inline-block">centre.</span></span>
          </>
        }
        lead="One place to know, govern and prove that every AI system in your organisation is under control. Live posture, structured evidence, continuous confidence."
        doodles={{ left: "star", right: "zigzag" }}
      />
      <FiveQuestions />
      <Lifecycle />
      <Pillars />
      <Cockpit />
      <AgentRun />
      <GetStarted
        title="See the platform in action."
        lead="A 45-minute walkthrough. Bring your AI systems and we'll show you where the gaps are."
      />
    </>
  );
}
