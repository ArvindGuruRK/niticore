import { Fragment } from "react";
import { Column, Row, Section, Text } from "@react-email/components";
import type { DemoRequest } from "@/lib/demo-request";
import { firstName, formatPhone } from "@/lib/demo-request";
import { C, EmailButton, EmailShell, Pill, panel, text } from "./theme";

/**
 * Sent to the visitor after they book a demo: a warm thank-you, what happens next, a recap of what
 * they sent, and the five questions the demo answers. Copy follows docs/content (04 §3: a 45-minute
 * walkthrough with a certified AI governance specialist; 02 §1: the five questions).
 */
export function DemoConfirmationEmail({
  request,
  agenda,
  siteUrl,
}: {
  request: DemoRequest;
  agenda: string[];
  siteUrl: string;
}) {
  const first = firstName(request.name);
  const host = siteUrl.replace(/^https?:\/\//, "") || "our website";

  return (
    <EmailShell
      preview={`Thanks, ${first}. Your Niticore demo request is in, and a specialist will be in touch.`}
      siteUrl={siteUrl}
      footerNote={`You're receiving this email because you requested a demo at ${host}. If that wasn't you, you can safely ignore it.`}
    >
      {/* Thank-you */}
      <Section style={panel}>
        <Text style={{ margin: "0 0 20px", fontSize: "28px", lineHeight: "28px", color: C.tertiary }}>✦</Text>
        <Text style={text.h1}>{`Thank you, ${first}.`}</Text>
        <Text style={{ ...text.h1, color: C.accent }}>We&apos;ve got your request.</Text>
        {/* The site's violet underline, as a bar */}
        <Section style={{ width: "72px", margin: "16px 0 24px 0" }}>
          <Row>
            <Column style={{ height: "4px", backgroundColor: C.tertiary, borderRadius: "999px" }} />
          </Row>
        </Section>
        <Text style={text.lead}>
          A certified AI governance specialist will be in touch to schedule your 45-minute live platform demo. Bring
          your AI systems, and we&apos;ll show you where the gaps are.
        </Text>
        <Section style={{ marginTop: "28px" }}>
          <EmailButton href={`${siteUrl}/platform`}>Explore the platform →</EmailButton>
        </Section>
      </Section>

      {/* What they sent */}
      <Section style={{ ...panel, marginTop: "16px", padding: "32px 36px" }}>
        <Text style={{ ...text.h2, marginBottom: "20px" }}>Your request</Text>
        <Detail label="Name" value={request.name} />
        <Detail label="Work email" value={request.email} />
        <Detail label="Company" value={request.company} />
        {request.phone && <Detail label="Phone" value={formatPhone(request.phone)} />}
        {request.frameworks.length > 0 && (
          <Section style={{ marginTop: "8px" }}>
            <Text style={{ ...text.label, marginBottom: "10px" }}>Frameworks</Text>
            <Text style={{ margin: 0 }}>
              {request.frameworks.map((f, i) => (
                // The space keeps plain-text versions readable ("EU AI Act GDPR")
                <Fragment key={f}>
                  {i > 0 && " "}
                  <Pill>{f}</Pill>
                </Fragment>
              ))}
            </Text>
          </Section>
        )}
        {request.notes && (
          <Section style={{ marginTop: "12px" }}>
            <Text style={{ ...text.label, marginBottom: "6px" }}>Your note</Text>
            <Text style={{ ...text.body, color: C.fg, whiteSpace: "pre-wrap" }}>{request.notes}</Text>
          </Section>
        )}
      </Section>

      {/* The five questions the demo answers */}
      <Section style={{ ...panel, marginTop: "16px", padding: "32px 36px" }}>
        <Text style={{ ...text.h2, marginBottom: "16px" }}>What we&apos;ll answer together</Text>
        {agenda.map((q, i) => (
          <Row key={q} style={{ marginBottom: i === agenda.length - 1 ? 0 : "12px" }}>
            <Column style={{ width: "40px", verticalAlign: "top" }}>
              <Text style={{ ...text.body, fontWeight: 700, color: C.tertiary }}>{String(i + 1).padStart(2, "0")}</Text>
            </Column>
            <Column>
              <Text style={{ ...text.body, color: C.fg, fontSize: "16px" }}>{q}</Text>
            </Column>
          </Row>
        ))}
      </Section>
    </EmailShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: "14px" }}>
      <Column style={{ width: "120px", verticalAlign: "top" }}>
        <Text style={text.label}>{label}</Text>
      </Column>
      <Column>
        <Text style={{ ...text.body, color: C.fg }}>{value}</Text>
      </Column>
    </Row>
  );
}
