import { Hero } from "@/components/hero/hero";
import { AgenticGovernance } from "@/components/sections/agentic-governance";
import { Faq } from "@/components/sections/faq";
import { FrameworkCards } from "@/components/sections/framework-cards";
import { GetStarted } from "@/components/sections/get-started";
import { GovernanceLoop } from "@/components/sections/governance-loop";
import { PersonaSwitcher } from "@/components/sections/persona-switcher";
import { StatStrip } from "@/components/sections/stat-strip";
import { VideoShowcase } from "@/components/sections/video-showcase";
import { Footer } from "@/components/footer";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <VideoShowcase />
        <FrameworkCards />
        <StatStrip />
        <PersonaSwitcher />
        <GovernanceLoop />
        <AgenticGovernance />
        <Faq />
        <GetStarted />
      </main>
      <Footer />
    </>
  );
}
