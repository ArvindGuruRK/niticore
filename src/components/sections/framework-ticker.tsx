const FRAMEWORKS = [
  "EU AI Act (2024/1689)",
  "ISO/IEC 42001:2023",
  "NIST AI RMF 1.0",
  "DIFC Regulation 10",
  "UAE PDPL (2027)",
  "ADGM DPR",
  "GDPR Art. 22",
];

/** The one marquee on the page. It signals breadth of coverage without demanding attention. */
export function FrameworkTicker() {
  return (
    <section
      aria-label="Supported compliance frameworks"
      className="group relative overflow-hidden border-y border-line bg-surface/40 py-6 [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none [@media(hover:hover)]:group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-14 pr-14 text-sm font-semibold tracking-tight text-fg-muted"
          >
            {FRAMEWORKS.map((name) => (
              <li key={name} className="whitespace-nowrap">
                {name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
