import { Fragment, type ReactNode } from "react";
import { Column, Link, Row, Section, Text } from "@react-email/components";
import type { DemoRequest } from "@/lib/demo-request";
import { firstName } from "@/lib/demo-request";
import { C, EmailButton, EmailShell, Pill, panel, text } from "./theme";

/**
 * Sent to the Niticore team for every Book a demo request: who it is at a glance, a one-click reply
 * (the email's reply-to is the visitor too), then every field and when it arrived.
 */
export function DemoNotificationEmail({
  request,
  submittedAt,
  siteUrl,
}: {
  request: DemoRequest;
  /** When the request arrived, already formatted, e.g. "26 Sep 2026, 14:02 UTC" */
  submittedAt: string;
  siteUrl: string;
}) {
  const first = firstName(request.name);
  const host = siteUrl.replace(/^https?:\/\//, "") || "the website";

  return (
    <EmailShell
      preview={`New demo request: ${request.name}, ${request.role} at ${request.company}`}
      siteUrl={siteUrl}
      footerNote={`Sent from the Book a demo form on ${host}. Replying to this email reaches ${first} directly.`}
    >
      <Section style={panel}>
        <Text style={{ margin: "0 0 20px", fontSize: "28px", lineHeight: "28px", color: C.tertiary }}>✦</Text>
        <Text style={text.h1}>New demo request</Text>
        <Text style={{ ...text.h1, fontSize: "24px", lineHeight: "32px", color: C.accent, marginTop: "6px" }}>
          {request.name}
        </Text>
        <Text style={{ ...text.lead, marginTop: "6px" }}>
          {request.role} · {request.company}
        </Text>
        <Section style={{ marginTop: "28px" }}>
          <EmailButton href={`mailto:${request.email}?subject=${encodeURIComponent("Your Niticore demo")}`}>
            {`Reply to ${first} →`}
          </EmailButton>
        </Section>
      </Section>

      <Section style={{ ...panel, marginTop: "16px", padding: "32px 36px" }}>
        <Text style={{ ...text.h2, marginBottom: "20px" }}>Details</Text>
        <Detail label="Name">{request.name}</Detail>
        <Detail label="Work email">
          <Link href={`mailto:${request.email}`} style={{ color: C.accent, textDecoration: "none" }}>
            {request.email}
          </Link>
        </Detail>
        <Detail label="Company">{request.company}</Detail>
        <Detail label="Role">{request.role}</Detail>
        <Detail label="Frameworks">
          {request.frameworks.length > 0 ? (
            request.frameworks.map((f, i) => (
              <Fragment key={f}>
                {i > 0 && " "}
                <Pill>{f}</Pill>
              </Fragment>
            ))
          ) : (
            <span style={{ color: C.subtle }}>None selected</span>
          )}
        </Detail>
        <Detail label="Notes">
          {request.notes ? (
            <span style={{ whiteSpace: "pre-wrap" }}>{request.notes}</span>
          ) : (
            <span style={{ color: C.subtle }}>No notes</span>
          )}
        </Detail>
        <Detail label="Received" last>
          {submittedAt}
        </Detail>
      </Section>
    </EmailShell>
  );
}

function Detail({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <Row style={{ marginBottom: last ? 0 : "14px" }}>
      <Column style={{ width: "120px", verticalAlign: "top" }}>
        <Text style={text.label}>{label}</Text>
      </Column>
      <Column>
        <Text style={{ ...text.body, color: C.fg }}>{children}</Text>
      </Column>
    </Row>
  );
}
