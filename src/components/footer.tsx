import { FooterMark } from "@/components/motion/footer-mark";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import Link from "next/link";

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

/**
 * Sitemap columns up top, then the NitiCore mark bleeding off the bottom edge, on the same
 * flat grid-bg canvas as the hero (see hero/hero.tsx). A hairline top border and panel radius
 * read as a lifted surface without breaking the dark, flat background rule. The grid drifts on
 * a scrubbed parallax as the footer crosses the viewport, for depth without moving the content.
 *
 * `sticky top-[100dvh]`: the classic curtain-reveal. The footer's top edge cannot scroll above
 * the viewport's bottom edge (100dvh down from the viewport top), so once scrolling would push
 * it past that line it clamps there instead, and the rest of the page keeps scrolling past/over
 * it underneath — the footer appears to rise up from behind the last section rather than just
 * follow the scroll. No extra scroll distance, no z-index/negative-margin trick required; native
 * scroll (Lenis smooths window scroll here, not a transform wrapper) drives it directly.
 */
export function Footer() {
  return (
    <footer className="sticky top-[100dvh] isolate overflow-hidden rounded-t-[2rem] border-t border-line-strong bg-canvas pt-6 shadow-panel sm:pt-8">
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
        <p className="type-caption">© {new Date().getFullYear()} NitiCore. All rights reserved.</p>
      </Container>
    </footer>
  );
}
