# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How to talk to me

- Use emojis in explanations, summaries and replies 🎯
- Keep explanations simple and easy to understand: plain words, short sentences, no jargon unless it's needed (and explain it when it is) 🙂

## What this is

Niticore is a multi-page marketing site for an AI governance platform. In site copy the brand is spelled "Niticore", not "NitiCore". The site is presentational (no data layer or auth), with one exception: Book a demo sends email through Resend from a Server Action (see "Book a demo emails" below). Its value is in the visual design and scroll animation.

Stack: Next.js 16 (App Router), React 19 with the React Compiler, Tailwind CSS v4 (CSS-first config, no `tailwind.config`) and TypeScript. For motion:

- **Lenis** handles smooth scrolling.
- **GSAP** (with ScrollTrigger) is the main animation engine.
- **React Bits** (https://reactbits.dev) provides certain effects. They are ported into `src/components/motion/` as `text-type.tsx`, `text-loop.tsx`, and `warp-text.tsx`, which runs on `ogl`/WebGL and is wrapped by `warp-heading.tsx`.
- **canvas-confetti** powers `motion/confetti.ts` (`celebrate`), in the brand palette. Use it only for finishing a whole flow, never on single actions.
- **Other animation libraries** are welcome and will be used heavily. Pick whichever suits the effect.

Whatever the library, put reusable motion components in `src/components/motion/`, use the timing in `@/lib/motion` where it applies, respect reduced motion, and show the effect on `/design-system`.

## The design system is mandatory

All UI must follow the Niticore design system, which is defined in `src/app/globals.css` and shown at `/design-system`. That covers colours, type, shape, spacing and motion. Build new UI from its tokens, utilities, `ui/` primitives and `motion/` components rather than one-off styles. If something is genuinely missing, add it to the design system (tokens in `globals.css`, a demo on `/design-system`) and then use it. The details are under "Design tokens" and "Animation system" below.

## Commands

```bash
npm run dev     # http://localhost:3000
npm run build   # production build; this is the type check
npm run lint    # ESLint 9 flat config (next core-web-vitals + typescript)
```

There are no tests. Check changes with `npm run lint` and `npm run build`.

## How the page is put together

- `src/app/layout.tsx` sets up the page shell: fonts (Sora for display, Manrope for body, JetBrains Mono for terminal text), metadata (title template `%s | Niticore`) and viewport, `AnnouncementBar`, `SmoothScroll`, `BackToTop`, and a `<noscript>` style block that un-hides animated content.
- `src/app/(site)/` is a route group whose `layout.tsx` renders `SiteNav` and `Footer` around every marketing page:
  - `page.tsx` is the landing page. It stacks the sections from `src/components/sections/` in order.
  - `platform/`, `frameworks/`, `assessments/`, `solutions/` and `academy-advisory/` are the nav pages; `demo/` is "Book a demo". The nav and footer links come from `NAV_LINKS` in `src/lib/site.ts`, and each page sets its metadata with `pageMetadata()` from the same file.
  - Inner pages open with `PageHero` (`src/components/page/`) and close with `GetStarted`. Page-specific sections live in a folder per page (`src/components/platform/`, `frameworks/`, `assessments/`, `solutions/`, `academy/`, `demo/`).
- Page copy can live in JSON under `src/content/` (`frameworks.json`, `assessments.json`, `solutions.json`, `academy.json`, `demo.json`), imported by the page. Edit the JSON to change text.
- `src/app/design-system/` is an internal showcase of the tokens, type scale and motion components. **Every animation, from any library, must also be shown here.**
- `src/app/opengraph-image.tsx` generates the social card.

In `src/components/`:

- Section files stay server components where possible. They compose client "leaf" components from `motion/` (Reveal, WarpHeading, CountUp, TiltCard, PinScrub, Marquee and others) and `illustrations/` (hand-drawn SVG doodles and the `governance-fabric` network graphic).
- `ui/` holds the primitives: `Button` (renders a `Link` when given `href`, variants primary, secondary and ghost), `Container` (max-w-7xl + `px-page`), form fields in `field.tsx` (`Field`, `Input`, `Textarea`, `CheckPill`), the custom dropdown `select.tsx` (`Select`; never use a native `<select>`) and `VideoPlayer`.
- Icons come from `@phosphor-icons/react`. In server components import from the `/ssr` entry, for example `@phosphor-icons/react/ssr` or `.../dist/ssr/<Name>`.

## Animation system

These conventions cover the GSAP and Lenis code. Other libraries can be used alongside it:

1. **One import point.** Take `gsap`, `ScrollTrigger` and `useGSAP` from `@/lib/gsap`, never from `gsap` directly. That module registers the plugins and sets `ignoreMobileResize` so pinned sections don't jump when the mobile URL bar collapses.
2. **Tokens.** Timing comes from `@/lib/motion`: `DUR`, `EASE`, `STAGGER`, `DIST`. Inside `useGSAP`, gate animations with `gsap.matchMedia()` using `NO_REDUCE`, and gate hover-only effects with `FINE_POINTER`.
3. **No flash before animation.** `globals.css` hides animation targets before JS runs, keyed on data attributes: `data-anim`, `data-anim-stagger`, `data-word`, `data-split`, `data-draw`, `data-clip`. This applies only under `prefers-reduced-motion: no-preference`. The `<noscript>` rule in `layout.tsx` reverses it. If you add a new pre-hidden attribute, update both files.
4. **Scrolling.** `SmoothScroll` runs Lenis from the GSAP ticker so ScrollTrigger and Lenis share one clock. Scroll programmatically with `getLenis()` from `@/lib/lenis`. Lenis is off under reduced motion, and touch uses native scrolling (`syncTouch` was tried and reverted as laggy).
5. **Nav and banner.** `SiteNav` writes a `--scroll-y` CSS variable. CSS combines it with `--banner-h` so the nav follows the announcement bar up the page. A scrubbed ScrollTrigger then docks the floating pill into a full-width bar.
6. **WebGL.** `motion/warp-text.tsx` is a ported React Bits `ogl` shader, used through `WarpHeading` for heading hover. Keep its logic unchanged. Tune the shared params instead.

## Design tokens

Everything is defined in `src/app/globals.css` (`@theme` plus `@utility`). There is no JS theme object.

- **Dark only.** In components use semantic colour roles such as `bg-canvas`, `bg-surface`, `bg-raised`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-accent`, `text-tertiary` and `border-line`. Don't use the raw `ink-*`, `signal-*` or `aura-*` ramps.
- **Accent rules.** Green (`accent`, #4AE057) is only for actions: CTAs and the one key word in a heading. Violet (`tertiary`) is for illustrations and secondary highlights, never buttons. `status-*` colours are only for alert text (LogStream, form error messages and invalid-field borders), score arcs (ScoreRing) and score fills (the readiness result bar). **No status dots**: never put a green, amber or red dot beside a label, level or list item. The one exception is the Frameworks enforcement timeline (`frameworks/regional.tsx`): green = in force, amber = upcoming.
- **Shape.** Controls are pills (`rounded-control`), panels use `rounded-panel` (20px), fields use `rounded-field` (12px).
- **Type.** Use the utilities, not ad-hoc sizes: `type-display`, `type-hero`, `type-h2`, `type-h3`, `type-h4`, `type-lead`, `type-body`, `type-small`, `type-caption`, `type-label`.
- **Layout.**
  - Spacing: `px-page`, `py-section`, `tap-target` (44px minimum).
  - Notch-safe padding: `pt-safe` and `pb-safe`, which rely on `--safe-*` and `viewport-fit=cover`.
  - Backgrounds and masks: `grid-bg` and `fabric-mask`.
  - Spacing is fluid through `clamp()`. Design mobile first; the desktop layout starts at `lg`.
- **Card tones.** Solid feature cards use `card-blue`, `card-violet` and `card-green`. For a `SpotlightCard`, take the matching cursor light from `CARD_TONES` in `src/lib/card-tones.ts`. No divider lines inside cards.
- **Z-index.** Only `--z-nav` and `--z-menu` exist.
- **Performance.** Don't put `backdrop-filter` on fixed or large surfaces. It caused scroll jank over the hero video. `body` uses `overflow-x: clip`, not `hidden`, so sticky elements and pinning still work.

## Content comes from `docs/` (text only)

`docs/` is where all site content comes from.

- `docs/content/*.md` is the main copy source: positioning and brand, platform architecture, frameworks and compliance, assessments and the readiness score, masterclass and advisory, industry verticals and personas, pricing, and the landing-page wireframe and copy.
- The client's concept is `docs/Trustlayer website concept 1.docx`. Its text is extracted in `docs/docx_extracted.txt`.
- `docs/*.html` holds the client's HTML concepts and prototypes (TrustLayer, the earlier product name, and the Niticore concept).
- `docs/inspiration/` holds reference screenshots.

**Every number on the site must come from `docs/`.** No invented figures, scores, amounts, dates or timestamps, not even in illustrative demos. If a design needs a number the docs don't have, leave the number out.

**From the HTML files and the concept, take only the text and content**: headlines, copy, section structure, features, numbers. **Take no design from them**: no colours, fonts, layouts, spacing, components, CSS or animations. All visual decisions come from our design system. Don't invent product claims that aren't in `docs/`.

`client-deliverable/` holds a standalone HTML export and a design write-up produced for the client. The Next app doesn't use it.

## Book a demo emails

- **Flow.** `src/components/demo/demo-form.tsx` submits (via `useActionState`, not `<form action>`, so typed values survive errors) to the Server Action `src/app/(site)/demo/actions.tsx`. It re-validates with `src/lib/demo-request.ts`, drops honeypot spam, emails the team (reply-to = visitor), then emails the visitor a confirmation (best effort).
- **Templates.** React Email components in `src/emails/` with inline styles; `theme.tsx` copies the design tokens as plain values (keep it in step with `globals.css`). The logo is a PNG from the static route `src/app/email-logo.png/route.tsx`, because many clients don't show SVG. Previews render on `/design-system` (Emails block).
- **Environment variables** (documented in `.env.example`): `RESEND_API_KEY`, `DEMO_TEAM_EMAIL` (comma-separated), optional `DEMO_FROM_EMAIL` (defaults to Resend's test sender `onboarding@resend.dev`, which only delivers to the Resend account's own email), optional `NEXT_PUBLIC_SITE_URL` (absolute links and images in emails; also `metadataBase`). Without the key or team email, the form shows "Demo requests aren't switched on yet."
- **Abuse protection** (`src/lib/demo-guard.ts`, `src/lib/rate-limit.ts`): requests without a matching browser `Origin` are rejected (Next.js only rejects a *mismatched* one); an in-memory sliding-window limit of 5 attempts per IP per 10 minutes and 3 sent requests per email per hour; optional global limit through the Vercel Firewall Rate Limiting SDK when `DEMO_RATE_LIMIT_ID` is set; a honeypot field; server-side validation; Server Action bodies capped at 64 KB (`next.config.ts`).
- **Security headers** (`next.config.ts`, every route): CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` (no script-src, so inline scripts and styles keep working), `X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin`, a locked-down `Permissions-Policy`, `COOP: same-origin`, HSTS (no preload), and no `X-Powered-By`.
- **Going live on a new Vercel account:** `vercel link` → `vercel integration add resend` (accept the terms, set the domain and region) → set `DEMO_TEAM_EMAIL` (and `NEXT_PUBLIC_SITE_URL`) with `vercel env add` → `vercel env pull` for local testing → verify the sending domain in Resend's DNS settings → set `DEMO_FROM_EMAIL` on that domain.
- **Firewall (after linking, staged: log first, then enforce).** Add a platform rate limit on the form's POSTs: `vercel firewall rules add "Book a demo rate limit" --condition '{"type":"path","op":"eq","value":"/demo"}' --condition '{"type":"method","op":"eq","value":"POST"}' --action rate_limit --rate-limit-window 600 --rate-limit-requests 20 --rate-limit-keys ip --rate-limit-action log --yes`, then `vercel firewall diff` and publish (`vercel firewall publish --yes`, run by a person). After reviewing its hits in the Firewall dashboard, edit `--rate-limit-action` to `rate_limit` and publish again. Optionally create a Rate Limiting SDK rule in the dashboard and put its id in `DEMO_RATE_LIMIT_ID`.

## SEO and AI discovery

- **One list of pages.** `PAGES` in `src/lib/site.ts` holds every public page's title and description. It feeds page metadata (`pageMetadata(path)`, which also sets the canonical URL and Open Graph), `sitemap.xml`, `llms.txt` and structured data. **A new public page must be added to `PAGES`.**
- **Files** (all static, built at build time): `src/app/sitemap.ts`, `src/app/robots.ts` (search and AI crawlers named and allowed; only `/design-system` is kept out, and it is `noindex`), `src/app/llms.txt/route.ts` and `src/app/llms-full.txt/route.ts` (Markdown for AI assistants, per llmstxt.org), `src/app/logo.png/route.tsx` (512 px square logo for structured data).
- **llms-full.txt is generated** by `src/lib/llms.ts` from the same data the pages render: the JSON in `src/content` and the exported constants in the FAQ and Platform sections. Keep page copy in those sources so the AI file never drifts from the site. Example figures are labelled as examples.
- **Structured data:** `src/components/seo/json-ld.tsx` renders JSON-LD safely (`<` escaped). Organization and WebSite on every page (root layout); FAQPage on the home page, from the FAQ items.

## House style

- **No eyebrows.** Never put a pill, badge or small label above a heading.
- **Heroes have no buttons.** "Book a demo" lives in the nav.
- **Illustrations are violet** (`text-tertiary`), including underline and circle marks.

Placeholders still in the code:
  - The showcase video points to an MDN sample clip.
  - Book a demo needs a Resend key and team inbox before it sends anything (see "Book a demo emails").
