import Image from "next/image";
import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogo } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Governance loop", href: "#platform" },
      { label: "Frameworks", href: "#frameworks" },
      { label: "Assessments", href: "#assessment" },
      { label: "Agent guardrails", href: "#agentic-heading" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Enterprise", href: "#solutions" },
      { label: "Academy & Advisory", href: "#advisory" },
      { label: "Book a demo", href: "#demo" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#faq" },
    ],
  },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: LinkedinLogo },
  { label: "X", href: "https://x.com", Icon: XLogo },
  { label: "GitHub", href: "https://github.com", Icon: GithubLogo },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-nav">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <Container className="relative flex flex-col gap-14 py-section">
        <Reveal stagger className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-xs flex-col gap-4">
            <Link href="/" aria-label="NitiCore home" className="w-fit rounded-control">
              <Image src="/logo/niticore.svg" alt="NitiCore" width={156} height={38} className="h-8 w-auto" />
            </Link>
            <p className="type-small">
              The operating layer for governed AI — continuous visibility, reusable evidence, and agent guardrails.
            </p>
            <ul className="flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-control border border-line text-fg-muted transition-colors duration-200 hover:border-line-strong hover:bg-white/[0.06] hover:text-fg"
                  >
                    <Icon weight="fill" className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-12">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <p className="type-label text-fg-subtle">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="type-small text-fg-muted transition-colors duration-200 hover:text-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </Reveal>

        <div className="flex flex-col-reverse items-center gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between">
          <p className="type-caption">© {new Date().getFullYear()} NitiCore. All rights reserved.</p>
          <p className="type-caption">Built for governed AI, everywhere.</p>
        </div>
      </Container>
    </footer>
  );
}
