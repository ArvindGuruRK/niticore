import { Hero } from "@/components/hero/hero";
import { FrameworkCards } from "@/components/sections/framework-cards";
import { VideoShowcase } from "@/components/sections/video-showcase";
import { SiteNav } from "@/components/site-nav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <VideoShowcase />
        <FrameworkCards />
      </main>
    </>
  );
}
