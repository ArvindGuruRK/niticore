import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import content from "@/content/demo.json";

/**
 * The Book a demo request: one shape, validated on the server. The browser's own checks (required,
 * email format) are a convenience only; anything can be posted to a server action, so every field is
 * checked again here against the same lists the form shows.
 */
export type DemoRequest = {
  name: string;
  email: string;
  company: string;
  /** International E.164 number (e.g. +971501234567), or "" when not given */
  phone: string;
  frameworks: string[];
  notes: string;
};

export type DemoField = "name" | "email" | "company" | "phone" | "notes";
export type DemoErrors = Partial<Record<DemoField, string>>;

/** Hidden trap field: people never see it, simple bots fill it in. */
export const HONEYPOT = "company_website";

const LIMITS = { name: 120, email: 254, company: 160, phone: 32, notes: 2000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Single-line fields must not carry line breaks (they end up in email subjects and headers)
const LINE_BREAK = /[\r\n]/;

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export type ParseResult =
  | { ok: true; data: DemoRequest }
  | { ok: false; errors: DemoErrors }
  | { ok: "spam" };

export function parseDemoRequest(form: FormData): ParseResult {
  if (text(form, HONEYPOT)) return { ok: "spam" };

  const name = text(form, "name");
  const email = text(form, "email");
  const company = text(form, "company");
  const phoneInput = text(form, "phone");
  const notes = text(form, "notes");
  // Only the frameworks the form offers, each once, in the form's order
  const picked = new Set(form.getAll("frameworks").filter((v): v is string => typeof v === "string"));
  const frameworks = content.form.frameworks.filter((f) => picked.has(f));

  const errors: DemoErrors = {};
  if (!name) errors.name = "Please enter your name.";
  else if (name.length > LIMITS.name || LINE_BREAK.test(name)) errors.name = "Please enter a shorter name.";

  if (!email) errors.email = "Please enter your work email.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "Please enter a valid email address.";

  if (!company) errors.company = "Please enter your company.";
  else if (company.length > LIMITS.company || LINE_BREAK.test(company)) errors.company = "Please enter a shorter company name.";

  // Optional, but when given it must be a real number for its country (Google's libphonenumber rules)
  let phone = "";
  if (phoneInput) {
    const parsed = phoneInput.length <= LIMITS.phone ? parsePhoneNumberFromString(phoneInput) : undefined;
    if (parsed?.isValid()) phone = parsed.number;
    else errors.phone = "Please enter a valid phone number for the country you picked.";
  }

  if (notes.length > LIMITS.notes) errors.notes = `Please keep this under ${LIMITS.notes} characters.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { name, email, company, phone, frameworks, notes } };
}

/** What the form shows after a submit attempt. */
export type DemoState =
  | { status: "idle" }
  | { status: "invalid"; errors: DemoErrors }
  | { status: "sent"; firstName: string; email: string; confirmationSent: boolean }
  | { status: "error"; message: string };

/** "+971501234567" -> "+971 50 123 4567", for display in emails. */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}

/** "Alex Morgan" -> "Alex". Used to greet people by first name. */
export const firstName = (name: string) => name.split(/\s+/)[0] || name;
