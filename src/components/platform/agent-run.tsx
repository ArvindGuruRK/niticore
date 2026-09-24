import { LogStream } from "@/components/motion/log-stream";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";

/** docs/content/02 §4: the six agentic governance pillars, in the doc's own short form. */
const CONTROLS = [
  { title: "Agent Identity", body: "Cryptographic agent ID, owner and role" },
  { title: "Autonomy Limits", body: "Pre-approved budgets and authority caps" },
  { title: "Tools & Data", body: "Allowed API endpoints and database privileges" },
  { title: "Hard Guardrails", body: "Actions strictly banned in code" },
  { title: "Human Oversight", body: "Mandatory human confirmation gates" },
  { title: "Runtime Auditing", body: "Live execution logs and safety drift" },
];

/** An illustrative run: what §4 says Niticore captures (tool calls, payloads) and enforces (circuit breakers). */
const RUN = [
  { time: "14:02:11", level: "info", text: "run started · owner=finance-ops" },
  { time: "14:02:11", level: "ok", text: "identity verified · cap=$10,000" },
  { time: "14:02:12", level: "allow", text: 'erp.lookup_vendor("Acme Ltd")' },
  { time: "14:02:12", level: "allow", text: 'db.read("invoices")' },
  { time: "14:02:13", level: "warn", text: "payments.create($48,000) > cap" },
  { time: "14:02:13", level: "block", text: "circuit breaker tripped" },
  { time: "14:02:13", level: "escalate", text: "human approval required · cfo" },
  { time: "14:02:14", level: "ok", text: "evidence logged · run paused" },
] as const;

/**
 * "Govern the agent, not just the model." The landing page already shows these six pillars as large
 * photo cards, so here they are a compact list next to a live example run that trips a circuit breaker.
 */
export function AgentRun() {
  return (
    <section aria-labelledby="agent-heading" className="pb-section">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHeader
            id="agent-heading"
            align="left"
            title="Govern the agent, not just the model."
            lead="AI is moving from passive predictions to autonomous agents that take irreversible actions. Niticore captures every tool call, payload and data change, and trips a circuit breaker the moment an agent leaves its bounds."
          />
          <Reveal stagger className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {CONTROLS.map((c, i) => (
              <div key={c.title} className="flex gap-3 border-t border-line pt-4">
                <span className="type-small font-bold tabular-nums text-tertiary">0{i + 1}</span>
                <div className="flex flex-col gap-1">
                  <p className="type-h4 text-fg">{c.title}</p>
                  <p className="type-small">{c.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal>
          <LogStream
            title="agents — niticore watch — zsh"
            command="niticore watch procurement-agent"
            lines={[...RUN]}
          />
        </Reveal>
      </Container>
    </section>
  );
}
