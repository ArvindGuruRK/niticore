import { Reveal } from "@/components/motion/reveal";
import { TextLoop } from "@/components/motion/text-loop";
import { WarpHeading } from "@/components/motion/warp-heading";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Closing CTA. Sits between the FAQ and the footer, spaced the same way every other
 *  section pair on the page is: only the section above contributes bottom space, this section
 *  adds none on top. The join banner sits inside this section, below the CTA, full-bleed. Its
 *  own bottom space is intentionally tight (not pb-section) so the ribbon sits close to the
 *  footer's top edge, not floating a full section-gap above it. Matches the footer's own
 *  internal rhythm (pt-6/8, mt-4/6) rather than the page's section-to-section spacing. */
export function GetStarted() {
  return (
    <section aria-labelledby="get-started-heading" className="pb-6 sm:pb-8">
      <Container>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <WarpHeading id="get-started-heading" text="Ready to get started?" className="type-h2 text-fg" />
          <p className="type-lead max-w-lg">
            Book a walkthrough or launch your first assessment. See the governance loop running on your own AI
            inventory in under a week.
          </p>
          <Button href="#demo" size="lg" arrow>
            Book a demo
          </Button>
        </Reveal>
      </Container>

      <div role="region" aria-label="Join NitiCore" className="mt-14 h-28 w-full sm:h-36">
        <TextLoop
          text="See AI Governance in Action ✦ Book a Demo"
          shape="wave"
          curviness={36}
          speed={70}
          separator="✦"
          fontSize={24}
          fontWeight={800}
          letterSpacing={1}
          uppercase
          color="var(--color-accent-ink)"
          ribbon
          ribbonColor="var(--color-accent)"
          ribbonWidth={52}
          pauseOnHover
          className="h-full"
        />
      </div>
    </section>
  );
}
