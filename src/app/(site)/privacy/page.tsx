import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { COMPANY, LEGAL_NAME, LEGAL_UPDATED, formatAddress } from "@/lib/company";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/privacy");

const address = formatAddress(COMPANY.address);
const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

/**
 * Written to match what this website actually does: the Book a demo form (demo-request.ts) emailed
 * through Resend, hosting and security on Vercel, IP-based rate limiting held in memory
 * (demo-guard.ts), a readiness check that runs only in the browser, and no analytics.
 * Keep it in step when any of that changes, and update LEGAL_UPDATED.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          This website is run by <strong>{LEGAL_NAME}</strong> (&ldquo;Niticore&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;), which decides how and why the personal data described here is used. In data protection
          terms, we are the controller.
        </p>
        {address && <p>Our registered office is at {address}.</p>}
        <p>
          We work from {new Intl.ListFormat("en-GB", { type: "conjunction" }).format(COMPANY.hubs)}. For any privacy
          question or request, email {mail}.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "What this policy covers",
    body: (
      <>
        <p>
          This policy covers this website and the ways you can contact us through it, such as booking a demo. It
          does not cover the Niticore platform, assessments, academy or advisory services we provide to customers.
          Those are covered by the agreements we sign with each customer.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "The data we collect",
    body: (
      <>
        <h3>Data you give us</h3>
        <p>When you book a demo, the form asks for:</p>
        <ul>
          <li>your name, work email and company;</li>
          <li>your phone number, if you choose to add it;</li>
          <li>the frameworks you are interested in, and anything you write in the notes.</li>
        </ul>
        <p>
          If you email us, we receive your email address and whatever you include in your message.
        </p>

        <h3>Data collected automatically</h3>
        <p>
          Like every website, ours receives technical data when your browser requests a page: your IP address, browser
          and device type, the page requested, the page that linked to it, and the date and time. Our hosting
          provider uses this to deliver the site and protect it from attacks.
        </p>
        <p>
          When the demo form is sent, we also use your IP address and email address to stop repeated or automated
          submissions. For this they are kept only in server memory, never in a database, and only submissions from
          the last hour count.
        </p>

        <h3>Data that stays on your device</h3>
        <p>
          The free readiness check on our{" "}
          <Link href="/assessments">Assessments</Link> page works out your score in your browser. Your answers are not
          sent to us.
        </p>

        <h3>Cookies</h3>
        <p>
          We only use cookies the site needs to work, and we ask before using any others. Our{" "}
          <Link href="/cookies">Cookie Policy</Link> lists them.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-data",
    title: "How we use it, and why",
    body: (
      <>
        <p>
          We only use personal data where the law allows it. Where the GDPR, the UK GDPR or a similar law applies,
          the legal basis for each use is in brackets.
        </p>
        <ul>
          <li>
            <strong>To answer your demo request</strong>: to arrange the demo, send you a confirmation email and
            follow up about it. (Taking steps at your request before a possible contract, and our legitimate interest
            in answering people who contact us.)
          </li>
          <li>
            <strong>To reply to your messages</strong>. (Our legitimate interest in answering people who contact us.)
          </li>
          <li>
            <strong>To keep the site secure and working</strong>: to block spam and abuse, and to find and fix faults.
            (Our legitimate interest in running a safe, reliable website.)
          </li>
          <li>
            <strong>To meet our legal obligations</strong>, and to establish or defend legal claims. (Legal obligation
            and legitimate interests.)
          </li>
          <li>
            <strong>Optional cookies</strong>, if we ever use them, only with your permission. (Consent.)
          </li>
        </ul>
        <p>
          We do not sell personal data, we do not use it for advertising, and we do not make decisions about you by
          automated means alone.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We share personal data only with those who need it to provide the service to you:</p>
        <ul>
          <li>
            <strong>Vercel</strong>, which hosts this website and protects it from attacks.
          </li>
          <li>
            <strong>Resend</strong>, which delivers the emails sent when you book a demo.
          </li>
          <li>
            <strong>The provider of our business email</strong>, where your request and our replies are kept.
          </li>
        </ul>
        <p>
          These providers act on our instructions and may not use your data for their own purposes. We may also share
          personal data with professional advisers, with authorities when the law requires it, or with a buyer or
          successor if our business is reorganised or sold, in which case this policy continues to protect it.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International transfers",
    body: (
      <p>
        Our providers may process data outside the country where you live, including in the United States. When the
        law requires it, we rely on recognised safeguards for these transfers, such as the European Commission&apos;s
        Standard Contractual Clauses and the UK&apos;s International Data Transfer Addendum.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <p>
          We keep demo requests and messages for as long as we need them to deal with your request and any
          relationship that follows, and for as long as the law requires. When we no longer need them, we delete or
          anonymise them.
        </p>
        <p>
          Data used to stop repeated form submissions lives only in server memory and is discarded when the server
          restarts. Our hosting provider keeps its technical logs for a limited period set by its own policies.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, data protection law may give you the right to:
        </p>
        <ul>
          <li>ask for a copy of the personal data we hold about you;</li>
          <li>have it corrected if it is wrong, or deleted;</li>
          <li>restrict or object to how we use it, including for direct marketing;</li>
          <li>receive it in a portable format;</li>
          <li>withdraw your consent at any time, where we rely on it.</li>
        </ul>
        <p>
          These rights come from laws such as the EU GDPR, the UK GDPR, the UAE Personal Data Protection Law, the
          DIFC and ADGM data protection regulations, and India&apos;s Digital Personal Data Protection Act. To use any
          of them, email {mail}. We may need to confirm your identity first, and we will reply within the time the law
          allows.
        </p>
        <p>
          If you are unhappy with how we handle your data, please tell us first so we can put it right. You also have
          the right to complain to the data protection authority where you live or work.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        The site is only served over encrypted connections, access to personal data is limited to the people who
        need it, and the demo form is protected against spam and automated abuse. No system is completely secure, but
        we work to protect your data and review our measures as the site changes.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        This website is meant for professionals and is not aimed at children. We do not knowingly collect personal
        data from children.
      </p>
    ),
  },
  {
    id: "other-sites",
    title: "Links to other sites",
    body: (
      <p>
        The site links to other websites and services, such as LinkedIn, Instagram, event organisers and AI
        assistants. They have their own privacy policies, and we are not responsible for how they handle your data.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy when the website or the law changes. The date at the top shows the latest version.
        If a change is significant, we will make it clear on this page.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title={<>Privacy Policy</>}
      updated={LEGAL_UPDATED}
      intro={
        <p>
          How we collect, use and protect personal data when you visit this website or get in touch. For the rules on
          using the site, see our <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      }
      summary={[
        <>
          <strong>We collect little.</strong> Only what you type into the demo form or an email, plus the technical data
          any website receives.
        </>,
        <>
          <strong>We never sell it</strong> and don&apos;t use it for advertising.
        </>,
        <>
          <strong>No tracking.</strong> There are no analytics or advertising cookies, and optional ones stay off unless
          you allow them.
        </>,
        <>
          <strong>You&apos;re in control.</strong> Ask to see, correct or delete your data at any time: {COMPANY.email}.
        </>,
      ]}
      sections={SECTIONS}
    />
  );
}
