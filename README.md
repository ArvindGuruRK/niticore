# Niticore

Marketing site for Niticore, the operating layer for governed AI.

Built with Next.js 16 (App Router), React 19 with the React Compiler, Tailwind CSS v4 and TypeScript. Motion runs on GSAP (with ScrollTrigger) and Lenis.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

## Checks

```bash
npm run lint    # ESLint
npm run build   # production build, which is also the type check
```

## Where things live

- `src/app/(site)/` holds the pages. Page copy lives in `src/content/*.json`.
- `src/app/globals.css` holds the design tokens. `/design-system` shows every token, component and animation.
- `src/lib/company.ts` holds the company facts used by the legal pages, the footer and structured data. The legal entity, registered address, phone and governing law are still to be filled in.
- Book a demo sends email through Resend. `.env.example` lists the environment variables it needs.

`CLAUDE.md` has the full conventions.
