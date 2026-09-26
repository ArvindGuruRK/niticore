import { CONTROLS } from "@/components/platform/agent-run";
import { DOMAINS, FEED } from "@/components/platform/cockpit";
import { QUESTIONS } from "@/components/platform/five-questions";
import { STAGES } from "@/components/platform/lifecycle";
import { PILLARS } from "@/components/platform/pillars";
import { ITEMS as FAQ } from "@/components/sections/faq";
import academy from "@/content/academy.json";
import assessments from "@/content/assessments.json";
import demo from "@/content/demo.json";
import frameworks from "@/content/frameworks.json";
import solutions from "@/content/solutions.json";
import { PAGES, SITE_URL, type PagePath } from "./site";

/**
 * llms.txt and llms-full.txt (https://llmstxt.org): plain Markdown that AI assistants and crawlers
 * can read without running the site's JavaScript. Everything is generated from the same data the
 * pages render (the JSON in src/content and the exported section constants), so it can't drift from
 * the site. Only what the pages say goes in; example dashboard figures are labelled as examples.
 */

const url = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;
const link = (path: PagePath) => `[${path === "/" ? "Home" : PAGES[path].title}](${url(path)})`;
const list = (items: readonly string[]) => items.map((i) => `- ${i}`).join("\n");
const block = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join("\n\n");

const SUMMARY =
  "Niticore is the operating layer for governed AI: an AI governance platform with continuous AI visibility, risk intelligence, controls and reusable compliance evidence, plus agent guardrails, from first idea to production. It maps one governance action to the EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation (DIFC, ADGM, PDPL) at once, and adds assessments, an AI governance academy and expert advisory.";

/** The short index: what Niticore is and where each topic lives. */
export function llmsIndex(): string {
  const pages = (Object.keys(PAGES) as PagePath[])
    .filter((p) => p !== "/" && p !== "/demo")
    .map((p) => `- ${link(p)}: ${PAGES[p].description}`)
    .join("\n");

  return block(
    "# Niticore",
    `> ${PAGES["/"].description}`,
    SUMMARY,
    `## Pages\n\n${pages}`,
    `## Full content\n\n- [llms-full.txt](${url("/llms-full.txt")}): every page's content in one Markdown file`,
    `## Optional\n\n- ${link("/demo")}: ${PAGES["/demo"].description}\n- [Home](${url("/")}): overview and FAQ`,
  );
}

function homeSection() {
  return block(
    `## Home (${url("/")})`,
    PAGES["/"].description,
    "### Frequently asked questions",
    FAQ.map((f) => `**${f.title}**\n\n${f.content}`).join("\n\n"),
  );
}

function platformSection() {
  return block(
    `## Platform (${url("/platform")})`,
    PAGES["/platform"].description,
    "### Five questions every board asks",
    QUESTIONS.map((q) => `- **${q.title}** ${q.body}`).join("\n"),
    "### The seven-stage governance lifecycle",
    STAGES.map((s, i) => `${i + 1}. **${s.title}** (${s.question}) ${s.points.join(" ")}`).join("\n"),
    "### Four platform pillars",
    PILLARS.map((p) => `**${p.title}**\n\n${list(p.points)}`).join("\n\n"),
    "### Executive cockpit (example dashboard)",
    "An illustrative Governance Health view, showing the kind of figures management sees, not customer results:",
    list([
      "Governance Readiness™ score: 78 / 100",
      ...DOMAINS.map((d) => `${d.label}: ${d.value}%`),
      ...FEED.map((f) => `${f.count} ${f.text}`),
    ]),
    "### Agentic AI governance: govern the agent, not just the model",
    CONTROLS.map((c) => `- **${c.title}:** ${c.body}`).join("\n"),
  );
}

function frameworksSection() {
  const { simulator, explorer, pipeline, regional } = frameworks;
  return block(
    `## Frameworks (${url("/frameworks")})`,
    PAGES["/frameworks"].description,
    `### ${simulator.title}`,
    simulator.lead,
    `Example: a ${simulator.action.title.toLowerCase()} on a ${simulator.action.subject.toLowerCase()} satisfies:\n\n${list(simulator.targets.map((t) => `${t.framework}: ${t.clause}`))}`,
    `Result: ${simulator.summary.map((s) => `${s.value} ${s.label}`).join(", ")}.`,
    `### ${explorer.title}`,
    explorer.lead,
    explorer.frameworks
      .map((f) =>
        block(
          `#### ${f.name} (${f.reference})`,
          f.status,
          "functions" in f && f.functions ? `Core functions: ${f.functions.join(", ")}.` : null,
          list(f.capabilities.map((c) => `**${c.title}:** ${c.body}`)),
        ),
      )
      .join("\n\n"),
    `### ${pipeline.title}`,
    pipeline.lead,
    pipeline.steps.map((s, i) => `${i + 1}. **${s.title}:** ${s.body}`).join("\n"),
    list(pipeline.points),
    `### ${regional.title}`,
    regional.lead,
    `Enforcement: ${regional.milestones.map((m) => `${m.label} (${m.date})`).join("; ")}.`,
    regional.jurisdictions
      .map((j) => block(`#### ${j.code}: ${j.name}`, `Law: ${j.law}`, list(j.capabilities)))
      .join("\n\n"),
  );
}

function assessmentsSection() {
  const { model, journey, suite } = assessments;
  return block(
    `## Assessments (${url("/assessments")})`,
    PAGES["/assessments"].description,
    `### ${model.title}`,
    model.lead,
    model.levels
      .map((l) => `- **Level ${l.level}, ${l.name} (${l.min}–${l.max}):** ${l.summary} ${l.traits} ${l.platform}`)
      .join("\n"),
    `### ${journey.title}`,
    journey.steps.map((s, i) => `${i + 1}. **${s.title}:** ${s.body}`).join("\n"),
    `### ${suite.title}`,
    suite.lead,
    suite.assessments
      .map((a) =>
        block(
          `#### ${a.number}. ${a.name}`,
          `Question: ${a.question} Format: ${a.format}${a.minutes ? ` (${a.minutes} minutes)` : ""}.`,
          list(a.deliverables),
          a.tags.length ? `${a.tagsTitle ?? "Covers"}: ${a.tags.join(", ")}.` : null,
        ),
      )
      .join("\n\n"),
  );
}

function solutionsSection() {
  const { industries, personas, statement } = solutions;
  const names = Object.fromEntries(industries.frameworks.map((f) => [f.id, f.name]));
  return block(
    `## Solutions (${url("/solutions")})`,
    PAGES["/solutions"].description,
    `### ${industries.title}`,
    industries.lead,
    industries.items
      .map((i) =>
        block(
          `#### ${i.name}`,
          `${i.tagline} ${i.description}`,
          `Critical AI use cases:\n\n${list(i.useCases)}`,
          `Frameworks that apply: ${i.frameworks.map((id) => names[id]).join(", ")}. ${i.also}`,
        ),
      )
      .join("\n\n"),
    `### ${personas.title}`,
    personas.lead,
    personas.items.map((p) => block(`#### ${p.role}`, `"${p.question}"`, list(p.provides))).join("\n\n"),
    `> ${statement.quote}\n>\n> ${statement.author}`,
  );
}

function academySection() {
  const { tracks, curriculum, outcomes, practice, engage } = academy;
  return block(
    `## Academy & Advisory (${url("/academy-advisory")})`,
    PAGES["/academy-advisory"].description,
    `### ${tracks.title}`,
    tracks.lead,
    tracks.items
      .map((t) => `- **${t.name}** (${t.for.replace(/\.$/, "")}): ${t.duration}, ${t.format.toLowerCase()}. ${t.description} Audience: ${t.audience}.`)
      .join("\n"),
    `### ${curriculum.title}`,
    curriculum.lead,
    curriculum.modules.map((m, i) => `${i + 1}. **${m.title}:** ${m.body}`).join("\n"),
    `### ${outcomes.title}`,
    list(outcomes.items),
    `### ${practice.title}`,
    practice.lead,
    practice.areas.map((a) => block(`#### ${a.name}: ${a.title}`, a.body, list(a.points))).join("\n\n"),
    `### ${engage.title}`,
    engage.lead,
    engage.models
      .map((m) => `- **${m.name}** (${m.duration}, ${m.kind.toLowerCase()}). Ideal for: ${m.idealFor}. Outcome: ${m.outcome}`)
      .join("\n"),
  );
}

function demoSection() {
  return block(
    `## Book a demo (${url("/demo")})`,
    PAGES["/demo"].description,
    `The demo answers:\n\n${list(demo.form.agenda)}`,
  );
}

/** Everything, in page order. */
export function llmsFull(): string {
  return block(
    "# Niticore",
    `> ${PAGES["/"].description}`,
    SUMMARY,
    homeSection(),
    platformSection(),
    frameworksSection(),
    assessmentsSection(),
    solutionsSection(),
    academySection(),
    demoSection(),
  );
}
