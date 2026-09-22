# NitiCore Design System

_The operating layer for governed AI — visual language and UI foundation._

This document describes the complete design system behind the NitiCore marketing site: color, type, spacing, shape, motion, and components. It is generated directly from the production codebase (`globals.css`, `lib/motion.ts`, and the component library), so every value below is live, not aspirational.

---

## 1. Design principles

- **Dark by default.** The brand mark carries white sparkle details, so the entire product runs on a deep indigo canvas rather than a light theme.
- **One action color.** Signal green (`#4AE057`) is reserved for calls to action and the single emphasized word in a headline. It never decorates.
- **One illustration color.** Aura violet is the tertiary accent — used for illustration, network diagrams, and secondary highlights. It is never used on buttons.
- **Status colors are reserved.** Amber and red exist only for alerts and risk/score states — never for decoration.
- **Three shapes, everywhere.** Controls (buttons, badges, pills) are fully rounded. Panels are 20px radius. Form fields are 12px radius. Nothing else.
- **Motion respects the reader.** Every animation reads from a shared token set and turns itself off for `prefers-reduced-motion`.

---

## 2. Color

### Brand inputs
| Token | Hex | Role |
|---|---|---|
| Canvas | `#06011F` | Base background for the entire product |
| Accent (Signal green) | `#4AE057` | Primary action color |

### Ink — neutral ramp (derived from the canvas hue)
| Token | Hex | Role |
|---|---|---|
| `ink-950` | `#06011F` | Canvas |
| `ink-900` | `#0C062B` | Surface |
| `ink-800` | `#140D3D` | Raised panels |
| `ink-700` | `#1D1552` | Hover fill |
| `ink-600` | `#2A2170` | Strong fill |

### Signal — action green ramp
| Token | Hex | Role |
|---|---|---|
| `signal-200` | `#C5F7CB` | Tint |
| `signal-300` | `#8DF09A` | Hover |
| `signal-400` | `#4AE057` | **Brand accent** |
| `signal-500` | `#38C946` | Pressed |
| `signal-600` | `#27A336` | Deep |
| `signal-700` | `#1D7D2A` | — |

### Aura — tertiary violet ramp
Sits ~135° from the brand green on the same canvas hue, so it reads as "a lit version of the canvas" rather than a competing brand color.

| Token | Hex | Role |
|---|---|---|
| `aura-200` | `#E4DBFF` | Tint |
| `aura-300` | `#C9B8FF` | Soft |
| `aura-400` | `#A98BFF` | **Tertiary accent** |
| `aura-500` | `#8B68F5` | Pressed |
| `aura-600` | `#6D4AD6` | Deep, fills only |

### Text
| Token | Hex | Role |
|---|---|---|
| `fg` | `#F2F0FB` | Headlines, primary text |
| `fg-muted` | `#CBC6E4` | Body copy |
| `fg-subtle` | `#A6A1C4` | Captions |

### Status (alerts and scores only)
| Token | Hex | Role |
|---|---|---|
| `status-ok` | `#4AE057` | Healthy |
| `status-warn` | `#F5B544` | Attention |
| `status-risk` | `#FF6B7A` | High risk |

### Structural
| Token | Value | Role |
|---|---|---|
| `line` | `rgb(255 255 255 / 0.08)` | Hairline borders |
| `line-strong` | `rgb(255 255 255 / 0.16)` | Emphasized borders |

### Contrast on canvas (WCAG)
| Pair | Ratio |
|---|---|
| `fg` on canvas | 18.1:1 |
| `fg-muted` on canvas | 12.3:1 |
| `fg-subtle` on canvas | 8.3:1 |
| `accent` on canvas | 11.7:1 |
| `tertiary` (aura) on canvas | 7.6:1 |
| Ink text on accent button | 11.7:1 |

All text/background pairs comfortably clear WCAG AA (4.5:1) and most clear AAA (7:1).

---

## 3. Typography

Two families, two jobs:

- **Sora** (weight 600) — display and headings only. Tight letter-spacing, tabular geometry.
- **Manrope** (weight 500) — everything you read. Deliberately a touch heavier than "regular" (400) so copy stays legible on the dark canvas.

Both load via `next/font/google` with `display: swap`.

### Type scale
All sizes are fluid (`clamp()`), so they scale smoothly between the smallest and largest supported viewport with no per-breakpoint overrides.

| Token | Spec | Sample use |
|---|---|---|
| `type-display` | Sora 600 · 44–80px · line-height 1.04 · tracking −0.04em | Largest display statements |
| `type-hero` | Sora 600 · 36–58px · line-height 1.08 · tracking −0.035em | Hero headline |
| `type-h2` | Sora 600 · 30–44px · line-height 1.12 · tracking −0.03em | Section headings |
| `type-h3` | Sora 600 · 22px · line-height 1.25 · tracking −0.02em | Sub-section headings |
| `type-h4` | Sora 600 · 18px · line-height 1.3 · tracking −0.015em | Card / component titles |
| `type-lead` | Manrope 500 · 17–20px · line-height 1.6 | Intro paragraphs, `fg-muted` |
| `type-body` | Manrope 500 · 16px · line-height 1.65 | Standard body copy, `fg-muted` |
| `type-small` | Manrope 500 · 14px · line-height 1.6 | Secondary copy, `fg-muted` |
| `type-caption` | Manrope 500 · 13px · line-height 1.5 | Meta text, `fg-subtle` |
| `type-label` | Manrope 700 · 12px · tracking 0.14em · uppercase | Eyebrows, small tags |

Global text rules: headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`; all text wraps safely (`overflow-wrap: break-word`) so long words or URLs never break layout.

---

## 4. Layout & spacing

### Container
- Max width: `7xl` (1280px), centered, with a fluid horizontal gutter (`px-page`).
- Gutter (`--spacing-gutter`): `clamp(1rem, 0.6rem + 1.6vw, 2rem)` — 16px on phones, up to 32px on desktop. Also respects device safe-area insets (notches).

### Vertical rhythm
- `py-section` (`--spacing-section`): `clamp(4rem, 2.4rem + 6vw, 8rem)` — the space between major sections, 64px to 128px.
- `spacing-stack`: `clamp(1.5rem, 1rem + 2vw, 3rem)` — the gap between elements inside one section.
- Minimum tap target: `44px` (`--spacing-tap`) on all interactive controls.

### Breakpoints (mobile-first)
| Name | Width | Notes |
|---|---|---|
| Base | 320px+ | Phones. Single column. |
| `sm` | 640px | Large phones. Nav shows the "Book a demo" button. |
| `md` | 768px | Tablet portrait. Two/three-column grids begin. |
| `lg` | 1024px | **Desktop layout begins here.** Full nav, hero illustration visible, pinned scroll effects active. |
| `xl` | 1280px | Desktop. |
| `2xl` | 1536px | Wide desktop. |

### Responsive behavior summary
| Breakpoint | Behavior |
|---|---|
| Mobile (320–639px) | Single column; background illustration sits under hero copy, not beside it; horizontal-scroll sections become native swipe rows; 44px touch targets everywhere. |
| Large phone (640px) | Nav reveals the primary CTA button. |
| Tablet (768–1023px) | Two/three-column grids begin; nav still uses the compact menu; no pinned horizontal scroll on touch tablets. |
| Desktop (1024px+) | Full navigation bar, hero illustration on the right, wide data rows, pinned horizontal-scroll sections active. |

### Viewport handling
- Full-height sections use `100dvh` (dynamic viewport height), never `100vh`, so the mobile browser's address bar never crops content.
- `viewport-fit=cover` plus CSS `env(safe-area-inset-*)` tokens keep content clear of notches and home indicators on supported devices.

---

## 5. Shape & elevation

One rule set, applied everywhere — no ad-hoc radii or shadows.

| Token | Value | Applies to |
|---|---|---|
| `radius-control` | `9999px` (pill) | Buttons, badges, tags, chips |
| `radius-panel` | `1.25rem` (20px) | Cards, panels, media frames |
| `radius-field` | `0.75rem` (12px) | Form fields, swatches |

### Shadows
Shadows are always tinted to the canvas hue — never pure black — with a subtle inner highlight for a glass-like edge.

- `shadow-panel`: `0 24px 60px -28px rgb(2 0 14 / 0.9), inset 0 1px 0 rgb(255 255 255 / 0.06)`
- `shadow-accent`: `0 10px 30px -12px rgb(74 224 87 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.3)` — used behind the primary button only.

---

## 6. Core components

### Button
Three variants, two sizes, always a pill, labels always stay on one line.

| Variant | Look | Use |
|---|---|---|
| `primary` | Solid signal green, ink-colored text, accent shadow | The one primary action per view ("Book a demo") |
| `secondary` | Glass outline — translucent white fill, blurred border | Secondary action ("Take the assessment") |
| `ghost` | Text only, fills on hover | Tertiary / low-emphasis actions |

Sizes: `md` (44px tall) and `lg` (48px tall). An optional trailing arrow icon nudges forward on hover.

Interaction states:
- Hover: lifts 1px, background lightens one step.
- Press: scales to 0.98.
- Focus: 2px solid accent-green outline, 3px offset (keyboard-visible only).
- Disabled: 50% opacity, not clickable.

### Eyebrow
Small pill label (uppercase, letter-spaced) used above headlines to set context, e.g. "The operating layer for governed AI." Editorial rule: **at most one eyebrow per three sections**, so it stays a signal, not wallpaper.

### Container
Centers content at a 1280px max width with the fluid gutter described above. Every section on the page uses this, never a hand-rolled width.

### Navigation
- Single line, 64px tall.
- Starts as a floating pill near the top of the page and smoothly widens into a full-bleed docked bar as the visitor scrolls past the first 160px — reinforcing that the page has "settled" into browsing mode.
- Collapses to a menu below the `sm` breakpoint; reveals the primary CTA button at `sm` and above.

### Footer
Uses `position: sticky; top: 100dvh` so it rises up from behind the final section as the visitor finishes scrolling, rather than simply trailing the page — no extra scroll distance or z-index tricks required. The footer wordmark animates in last, cropped to its top 70%.

### Announcement bar
A slim bar above the nav for timely messages (e.g. event announcements), with a marquee/loop treatment.

---

## 7. Motion system

All animation is built on **GSAP + ScrollTrigger**, with **Lenis** providing inertial smooth-scroll on the same render ticker (so scroll-driven animation and scroll position never drift apart). Every animation reads from one shared token set and is fully disabled under `prefers-reduced-motion: no-preference` (i.e., respects the OS accessibility setting).

### Motion tokens
| Token | Value |
|---|---|
| Duration — fast | 0.35s |
| Duration — base | 0.8s |
| Duration — slow | 1.2s |
| Stagger | 0.09s |
| Travel distance (rise-in) | 28px |
| Ease — out | `expo.out` |
| Ease — in/out | `power3.inOut` |
| Scrub | linear, 0.3–0.6s lag |

### Animation catalog
| Animation | Trigger | What it does |
|---|---|---|
| Hero load-in | Page load | Staggered rise, one element at a time |
| Reveal | Enters viewport, once | Fade + rise, as a single block or staggered children |
| Text reveal | Scrubbed to scroll | Words light up as the paragraph crosses the viewport |
| Parallax | Scrubbed to scroll | Depth drift on imagery and panels |
| Count up | Enters viewport, once | Scores and metrics tween up from zero |
| Pin and scrub | Pinned, scrubbed | Powers the multi-stage governance loop section |
| Magnetic | Pointer proximity | Primary CTA is gently pulled toward the cursor (fine pointers only) |
| Back to top | Appears after 320px scroll | Circular button with a page-progress ring; scroll driven by Lenis |
| Nav float → dock | First 160px of scroll | Floating pill widens into a full-width bar |
| Smooth scroll | Always on | Lenis inertial scrolling |
| Governance Fabric | Load + pointer | Canvas network animation: nodes assemble, pulses travel the links, pointer repels nearby nodes |
| Split heading | Enters viewport, once | Headline reveals by masked line or word rise; re-splits on resize and after fonts load |
| Scramble text | Enters viewport / hover | Characters decode in from noise |
| Text type | Load, loops | Typewriter effect: types, holds, deletes, loops through a list of strings |
| Scramble word | Hover, fine pointers | A single word scrambles on hover inside a headline |
| Media reveal | Enters viewport, once | Clip-path wipe with an inner zoom settle, for screenshots/imagery |
| Spotlight card | Pointer | A light follows the cursor across the card fill and border |
| Tilt card | Pointer | 3D tilt toward the pointer with a moving sheen |
| Score ring | Enters viewport, once | Circular gauge sweeps and counts up, colored by status |
| Bar meter | Enters viewport, once | Staggered coverage bars |
| Draw path | Entry or scrubbed | SVG line draws itself — used for connectors and flow diagrams |
| Marquee | Always on | Seamless looping strip; speeds up with scroll velocity, reverses on scroll-up, pauses on hover |
| Timeline | Scrubbed | Progress line fills and each node lights up as it's reached |
| Accordion | Click / keyboard | Height tween; closed panels are inert (not just hidden) |
| Tabs | Click / keyboard | Sliding pill indicator with fade-rise panel swap; full arrow-key navigation |
| Horizontal scroll | Pinned, scrubbed (desktop only) | Vertical scroll drives a sideways-moving card track; becomes a native swipe row on mobile |
| Illustrations | Load / enters viewport | Hand-drawn line art that draws itself in (see below) |
| Footer mark | Enters viewport, once, last | Rises and settles; logomark stays cropped to its top 70% |

### Motion accessibility rules
- Every reveal target is pre-hidden only when `prefers-reduced-motion: no-preference` — reduced-motion users never see a hidden/flashing state, and a `<noscript>` fallback forces everything visible if JavaScript fails to load.
- Pointer-driven effects (magnetic, tilt, spotlight, scramble word) are gated to `(hover: hover) and (pointer: fine)` — i.e., they never trigger on touch.

---

## 8. Illustration system

Hand-drawn line-art elements that "draw themselves" on screen using SVG stroke animation (DrawSVG), colored via `currentColor` so they inherit whatever text color surrounds them.

| Component | Description |
|---|---|
| Doodle | Base primitive all other illustrations build on |
| Sparkle | Small accent mark |
| Flourish | Decorative line flourish |
| StarArc | Arcing star mark |
| Annotate | Hand-drawn circle/underline that draws around a target word or phrase |
| Governance Fabric | The animated node-and-line network canvas used in the hero — nodes assemble, pulses travel the connections, and nearby nodes gently repel from the cursor |

**Placement rule:** illustrations stay in the page margins, bleeding off the viewport edge — never inserted between content blocks, so they read as atmosphere, not clutter.

---

## 9. Layout rules (locked)

These are fixed conventions the whole site follows, so new sections stay consistent:

- Container is max-width 1280px with the fluid gutter described above, and is safe-area aware.
- Hero sections use `min-height: 100dvh`, never `100vh`; top padding is capped at 6rem (96px).
- Navigation is a single 64px-tall line.
- Multi-column layouts collapse to one column below 768px; wide data rows/tables wait until `lg` (1024px).
- Z-index has exactly two layers: navigation (`z-index: 50`) and scroll-progress/mobile menu (`z-index: 60`). Nothing else uses z-index.
- The footer uses `position: sticky; top: 100dvh` to rise into view (see §6).

---

## 10. Accessibility

- Text selection uses the OS-standard blue (`#0078D7`), not the brand green, matching user expectation.
- Keyboard focus is always visible: a 2px solid accent-green outline with 3px offset on any focused control.
- Minimum touch target is 44×44px on every interactive element.
- All color pairings meet or exceed WCAG AA contrast (see table in §2); most exceed AAA.
- `prefers-reduced-motion` is respected globally — every animation has a static, fully visible fallback state.
- Semantic heading levels, `text-wrap: balance/pretty`, and safe word-breaking are applied globally so text never overflows or becomes unreadable.

---

## 11. Reference

This design system is implemented as design tokens in a single source file (`globals.css`, using Tailwind CSS v4's `@theme` layer) plus a small set of motion tokens (`lib/motion.ts`). Every value in this document maps 1:1 to a token in those files, and a living version of this document — with every color, type style, component, and animation rendered and interactive — exists in the product's internal `/design-system` reference page.

---

_Generated from the NitiCore codebase design tokens and the internal `/design-system` reference page._
