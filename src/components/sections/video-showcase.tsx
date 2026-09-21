import { ScrollExpand } from "@/components/motion/scroll-expand";
import { VideoPlayer } from "@/components/ui/video-player";

/** Placeholder clip. Swap for the product walkthrough (mp4/webm) when it exists. */
const VIDEO_SOURCES = [
  { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", type: "video/webm" },
  { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", type: "video/mp4" },
];

/** Product video under the ticker. The frame grows to full size as it scrolls into view. */
export function VideoShowcase() {
  return (
    <section aria-label="Product video" className="px-page pb-section pt-12 sm:pt-16">
      <div className="mx-auto max-w-6xl">
        <ScrollExpand className="aspect-video rounded-[2rem] border border-line shadow-panel sm:rounded-[2.5rem]">
          <VideoPlayer sources={VIDEO_SOURCES} />
        </ScrollExpand>
      </div>
    </section>
  );
}
