import { LogStream } from "@/components/motion/log-stream";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";

/** docs/content/02 §4: the six agentic governance pillars, in the doc's own short form. */
export const CONTROLS = [
  { title: "Agent Identity", body: "Cryptographic agent ID, owner and role" },
  { title: "Autonomy Limits", body: "Pre-approved budgets and authority caps" },
  { title: "Tools & Data", body: "Allowed API endpoints and database privileges" },
  { title: "Hard Guardrails", body: "Actions strictly banned in code" },
  { title: "Human Oversight", body: "Mandatory human confirmation gates" },
  { title: "Runtime Auditing", body: "Live execution logs and safety drift" },
];

/**
 * An illustrative run built only from docs/content/02 §4: agent identity, authority caps, allowed
 * endpoints and database privileges, the circuit breaker, the human confirmation gate and runtime
 * logging. No invented times, amounts or names.
 */
const RUN = [
  { level: "info", text: "agent run started" },
  { level: "ok", text: "agent identity verified · owner and role on record" },
  { level: "allow", text: "tool call · allowed API endpoint" },
  { level: "allow", text: "database read · within granted privileges" },
  { level: "warn", text: "action exceeds pre-approved authority cap" },
  { level: "block", text: "circuit breaker tripped · action halted" },
  { level: "escalate", text: "human confirmation gate · approval required" },
  { level: "ok", text: "execution logged for runtime audit" },
] as const;

/**
 * "Govern the agent, not just the model." The landing page already shows these six pillars as large
 * photo cards, so here they are a compact list next to a live example run that trips a circuit breaker.
 */
export function AgentRun() {
  return (
    <section aria-labelledby="agent-heading" className="pb-section">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
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
            command="niticore watch agent"
            lines={[...RUN]}
          />
        </Reveal>
      </Container>
    </section>
  );
}
