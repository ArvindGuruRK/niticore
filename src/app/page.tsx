import { Hero } from "@/components/hero/hero";
import { FrameworkTicker } from "@/components/sections/framework-ticker";
import { VideoShowcase } from "@/components/sections/video-showcase";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <FrameworkTicker />
        <VideoShowcase />
      </main>
    </>
  );
}
