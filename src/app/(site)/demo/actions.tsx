"use server";

import { headers } from "next/headers";
import { render } from "@react-email/components";
import { checkRateLimit } from "@vercel/firewall";
import { Resend } from "resend";
import content from "@/content/demo.json";
import { emailLimiter, ipLimiter, isSameOrigin } from "@/lib/demo-guard";
import { firstName, parseDemoRequest, type DemoState } from "@/lib/demo-request";
import { clientIp } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { DemoConfirmationEmail } from "@/emails/demo-confirmation";
import { DemoNotificationEmail } from "@/emails/demo-notification";

/** Resend's shared test sender: works before a domain is verified, but only delivers to the account owner. */
const TEST_SENDER = "Niticore <onboarding@resend.dev>";

const NOT_READY = "Demo requests aren't switched on yet. Please try again soon.";
const FAILED = "We couldn't send your request just now. Please try again in a moment.";
const LIMITED = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
const BLOCKED = "We couldn't accept this request. Please reload the page and try again.";

/**
 * Global rate limit through the Vercel Firewall (Rate Limiting SDK), on when DEMO_RATE_LIMIT_ID names
 * a rate-limit rule defined in the project's Firewall. Counts per client IP across every instance.
 * If the check itself fails, the in-memory limits still apply (fail open, logged).
 */
async function firewallLimited(requestHeaders: Headers): Promise<boolean> {
  const id = process.env.DEMO_RATE_LIMIT_ID?.trim();
  if (!id) return false;
  try {
    const { rateLimited, error } = await checkRateLimit(id, { headers: requestHeaders });
    if (error === "not-found") console.warn(`[book-a-demo] Firewall rate limit "${id}" not found.`);
    return rateLimited || error === "blocked";
  } catch (error) {
    console.error("[book-a-demo] Firewall rate-limit check failed:", error);
    return false;
  }
}

/**
 * Book a demo. Runs on the server only, so the Resend key never reaches the browser.
 *
 * 0. Guard: reject requests without a matching browser Origin, then rate-limit per IP (in memory, and
 *    globally through the Vercel Firewall when configured), then per email after validation.
 * 1. Validate every field again (anything can be posted to an action), and quietly drop bot traffic
 *    caught by the honeypot, showing bots the same success as people.
 * 2. Email the team first. That is the request itself, so if it fails the visitor is told to try again.
 *    Its reply-to is the visitor, so the team can answer straight from their inbox.
 * 3. Email the visitor a confirmation. If only this fails (for example, Resend's test sender refusing
 *    outside addresses), the request still counts as sent, since the team has it.
 *
 * Configuration (environment variables):
 * - RESEND_API_KEY: added automatically by the Vercel Marketplace Resend integration
 * - DEMO_TEAM_EMAIL: where requests go; several addresses may be comma-separated
 * - DEMO_FROM_EMAIL: optional sender on a verified domain, e.g. "Niticore <demo@example.com>";
 *   defaults to Resend's test sender
 * - NEXT_PUBLIC_SITE_URL: the live site address, used for links and the logo in the emails
 * - DEMO_RATE_LIMIT_ID: optional id of a Vercel Firewall rate-limit rule (see CLAUDE.md)
 */
export async function requestDemo(_previous: DemoState, form: FormData): Promise<DemoState> {
  // 0. Guards, cheapest first
  const requestHeaders = new Headers(await headers());
  if (!isSameOrigin(requestHeaders)) {
    console.warn("[book-a-demo] Rejected: missing or foreign Origin.");
    return { status: "error", message: BLOCKED };
  }
  if (!ipLimiter.take(clientIp(requestHeaders)).allowed || (await firewallLimited(requestHeaders))) {
    console.warn("[book-a-demo] Rate limited by IP.");
    return { status: "error", message: LIMITED };
  }

  const parsed = parseDemoRequest(form);
  if (parsed.ok === "spam") return { status: "sent", firstName: "", email: "", confirmationSent: false };
  if (!parsed.ok) return { status: "invalid", errors: parsed.errors };
  const request = parsed.data;

  const emailKey = request.email.toLowerCase();
  if (!emailLimiter.allows(emailKey)) {
    console.warn("[book-a-demo] Rate limited by email.");
    return { status: "error", message: LIMITED };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const team = (process.env.DEMO_TEAM_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const from = process.env.DEMO_FROM_EMAIL?.trim() || TEST_SENDER;

  if (!apiKey || team.length === 0) {
    console.error("[book-a-demo] Not configured: set RESEND_API_KEY and DEMO_TEAM_EMAIL.");
    return { status: "error", message: NOT_READY };
  }

  const resend = new Resend(apiKey);
  const submittedAt = `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date())} UTC`;

  const notification = <DemoNotificationEmail request={request} submittedAt={submittedAt} siteUrl={SITE_URL} />;
  const confirmation = <DemoConfirmationEmail request={request} agenda={content.form.agenda} siteUrl={SITE_URL} />;

  // 2. The team notification: the request itself
  try {
    const [html, text] = await Promise.all([render(notification), render(notification, { plainText: true })]);
    const { error } = await resend.emails.send({
      from,
      to: team,
      replyTo: request.email,
      subject: `New demo request: ${request.name}, ${request.company}`,
      html,
      text,
      tags: [{ name: "category", value: "demo_request" }],
    });
    if (error) {
      console.error("[book-a-demo] Team notification failed:", error);
      return { status: "error", message: FAILED };
    }
    emailLimiter.record(emailKey);
  } catch (error) {
    console.error("[book-a-demo] Team notification threw:", error);
    return { status: "error", message: FAILED };
  }

  // 3. The visitor's confirmation: best effort
  let confirmationSent = true;
  try {
    const [html, text] = await Promise.all([render(confirmation), render(confirmation, { plainText: true })]);
    const { error } = await resend.emails.send({
      from,
      to: request.email,
      replyTo: team[0],
      subject: "Thanks, we've got your demo request",
      html,
      text,
      tags: [{ name: "category", value: "demo_confirmation" }],
    });
    if (error) {
      confirmationSent = false;
      console.error("[book-a-demo] Confirmation email failed:", error);
    }
  } catch (error) {
    confirmationSent = false;
    console.error("[book-a-demo] Confirmation email threw:", error);
  }

  return { status: "sent", firstName: firstName(request.name), email: request.email, confirmationSent };
}
