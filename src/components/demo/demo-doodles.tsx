import { CalendarCheck } from "@/components/illustrations/calendar-check";
import { ChatBubbles } from "@/components/illustrations/chat-bubbles";
import { Drift } from "@/components/illustrations/drift";
import { FlyingPlane } from "@/components/illustrations/flying-plane";
import { Sparkle } from "@/components/illustrations/sparkle";

/**
 * Hand-drawn margins for Book a demo, in the site's violet line art, anchored to the booking card's
 * edges rather than to percentages of the page, so they stay put as content changes:
 * - a paper plane on the right, level with the card's heading and the top of the agenda, flying in
 *   from off-screen right with its looping trail drawing behind it ("request sent")
 * - two speech bubbles on the right, midway between them, drawing themselves and then "typing"
 *   ("we'll talk it through"), the middle step of the story
 * The sparkle, the plane and the bubbles all start drawing together as the page opens; the calendar,
 * lower down, draws when it is scrolled into view.
 * - a calendar with a check on the right, level with the "Request my demo" button at the card's
 *   foot ("slot booked")
 * - a sparkle in the left margin beside the card
 * All drift gently once in. They sit behind the content, so the card always covers any overlap.
 * Hidden below md, where there is no margin to hold them.
 */
export function DemoDoodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden text-tertiary md:block">
      <Sparkle size={48} trigger="load" delay={0.4} className="absolute left-[3vw] top-[16%]" />
      {/* Top of the card: the section's top padding (lg:pt-40) plus a little */}
      <Drift delay={3} className="absolute right-0 top-[calc(10rem+var(--safe-top))] w-[clamp(10rem,15vw,16rem)]">
        <FlyingPlane delay={0.4} className="w-full" />
      </Drift>
      {/* Midway between the plane and the calendar */}
      <Drift delay={3.2} amount={9} className="absolute right-[0.5vw] top-1/2 w-[clamp(8rem,12vw,13rem)] -translate-y-1/2 -rotate-6">
        {/* Starts with the plane and the sparkle */}
        <ChatBubbles trigger="load" delay={0.4} className="w-full" />
      </Drift>
      {/* Foot of the card, beside the submit button: the section's bottom padding plus a little */}
      <Drift
        delay={3}
        amount={8}
        className="absolute bottom-[calc(var(--spacing-section)+1rem)] right-[-2vw] w-[clamp(7rem,11vw,12rem)] rotate-12"
      >
        <CalendarCheck
          trigger="view"
          start="top 88%"
          delay={0.2}
          duration={0.7}
          stagger={0.35}
          strokeWidth={3}
          className="w-full"
        />
      </Drift>
    </div>
  );
}
