import Link from "next/link";
import { FooterMark } from "@/components/motion/footer-mark";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

const SITEMAP = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "#platform" },
  { label: "Frameworks", href: "#frameworks" },
  { label: "Assessments", href: "#assessment" },
  { label: "Solutions", href: "#solutions" },
];

const SOCIALS = [
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
  { label: "GitHub", href: "#" },
];

const INFOS = [
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

type FooterLink = { label: string; href: string };

function FooterColumn({ index, title, links }: { index: string; title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="type-h3 mb-4 flex items-baseline gap-2 text-fg-subtle">
        <span className="text-accent">{index}/</span>
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="type-h4 text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Extra scroll runway, as a share of the viewport height, spent with the footer already fully
// risen and parked flush against the viewport's bottom edge before the page finally ends. This is
// the "pause that sticks at the bottom" — plain scroll distance, not an animated property, so it
// needs no reduced-motion guard.
const DWELL_VH = 50;

/**
 * Sitemap columns up top, then the Niticore mark bleeding off the bottom edge, on the same
 * flat grid-bg canvas as the hero (see hero/hero.tsx). A hairline top border and panel radius
 * read as a lifted surface without breaking the dark, flat background rule. The grid drifts on
 * a scrubbed parallax as the footer crosses the viewport, for depth without moving the content.
 *
 * Curtain-then-hold: `<footer>` is `sticky bottom-0`, preceded by a plain spacer inside a shared
 * wrapper. Because the spacer sits *before* the footer (not after), the footer's natural place in
 * the document is already at the very bottom of that wrapper — which is exactly the arrangement
 * `sticky bottom-0` needs to hold at the viewport's bottom edge for the spacer's whole height
 * instead of not sticking at all. The result needs no JS: as the wrapper scrolls up from below,
 * the footer's top edge is what leads, rising into view first while its lower half is still off-
 * screen (arising from the top, never a bottom-up pop-in), then locks flush against the bottom of
 * the viewport for the spacer's height before the page runs out of scroll — the pause.
 */
export function Footer() {
  return (
    <div className="relative">
      <div aria-hidden style={{ height: `${DWELL_VH}vh` }} />
      <footer className="sticky bottom-0 isolate overflow-hidden rounded-t-[2rem] border-t border-line-strong bg-canvas pt-6 shadow-panel sm:pt-8">
        <Parallax amount={10} className="absolute inset-0 -z-10">
          <div aria-hidden className="grid-bg absolute inset-x-0 -top-[12%] h-[124%]" />
        </Parallax>

        <Container className="relative">
          <Reveal stagger className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            <FooterColumn index="01" title="Sitemap" links={SITEMAP} />
            <FooterColumn index="02" title="Socials" links={SOCIALS} />
            <FooterColumn index="03" title="Infos" links={INFOS} />
          </Reveal>
        </Container>

        <FooterMark className="mt-4 sm:mt-6" />

        <Container className="relative border-t border-line py-6">
          <p className="type-caption">© {new Date().getFullYear()} Niticore. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}
