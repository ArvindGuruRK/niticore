import { Hero } from "@/components/hero/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { AgenticGovernance } from "@/components/sections/agentic-governance";
import { Faq, ITEMS as FAQ } from "@/components/sections/faq";
import { FrameworkCards } from "@/components/sections/framework-cards";
import { GetStarted } from "@/components/sections/get-started";
import { GovernanceLoop } from "@/components/sections/governance-loop";
import { PersonaSwitcher } from "@/components/sections/persona-switcher";
import { StatStrip } from "@/components/sections/stat-strip";
import { VideoShowcase } from "@/components/sections/video-showcase";

/** The FAQ as schema.org FAQPage, from the same items the section renders */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.title,
    acceptedAnswer: { "@type": "Answer", text: item.content },
  })),
};

export default function Home() {
  return (
    <>
      <JsonLd data={FAQ_JSON_LD} />
      <Hero />
      <VideoShowcase />
      <FrameworkCards />
      <StatStrip />
      <PersonaSwitcher />
      <GovernanceLoop />
      <AgenticGovernance />
      <Faq />
      <GetStarted />
    </>
  );
}
