import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { COMPANY, LEGAL_NAME, LEGAL_UPDATED } from "@/lib/company";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/terms");

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

/** Terms for using this website. The platform and services have their own customer agreements. */
const SECTIONS: LegalSection[] = [
  {
    id: "about-these-terms",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms apply when you use this website (the &ldquo;site&rdquo;), which is run by{" "}
          <strong>{LEGAL_NAME}</strong> (&ldquo;Niticore&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the
          site, you agree to them. If you do not agree, please do not use the site.
        </p>
        <p>
          If you use the site on behalf of an organisation, you confirm that you may accept these terms for it.
        </p>
      </>
    ),
  },
  {
    id: "our-services",
    title: "The site and our services",
    body: (
      <p>
        The site tells you about Niticore: our platform, assessments, academy and advisory services. Using the site
        does not give you access to any of them. They are provided under separate agreements, and if one of those
        agreements conflicts with these terms, the agreement wins.
      </p>
    ),
  },
  {
    id: "not-advice",
    title: "Information, not advice",
    body: (
      <>
        <p>
          The site explains AI governance and regulation, including frameworks such as the EU AI Act, ISO/IEC 42001,
          the NIST AI RMF and the GDPR. This is general information, not legal, regulatory or professional advice.
          Laws change and apply differently to each organisation, so check the official texts and take advice before
          you rely on anything here.
        </p>
        <p>
          The free readiness check gives an indicative score based only on your answers. Dashboards, scores and
          figures shown as examples on the site are illustrations, not results from real customers.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Using the site",
    body: (
      <>
        <p>You may use the site for lawful purposes. You agree not to:</p>
        <ul>
          <li>break the law, or infringe anyone&apos;s rights, while using it;</li>
          <li>try to gain unauthorised access to the site, its servers or any connected system;</li>
          <li>disrupt or overload the site, or introduce viruses or other harmful code;</li>
          <li>send demo requests or messages that are false, automated or made in someone else&apos;s name;</li>
          <li>copy the site&apos;s content in bulk, or use it to build a competing product or service.</li>
        </ul>
        <p>
          Search engines and AI assistants may read the site as our{" "}
          <a href="/robots.txt">robots.txt</a> file allows.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Our content and brand",
    body: (
      <>
        <p>
          The site and everything on it, including its text, design, illustrations, animations and code, and the
          Niticore name and logo, belong to us or the people who license them to us. You may view the site, share
          links to it, and quote short passages with credit to Niticore. Any other use needs our written permission.
        </p>
        <p>
          Names and logos of laws, standards and frameworks belong to their owners. We show them only to identify
          those frameworks, and doing so does not mean their owners endorse Niticore.
        </p>
      </>
    ),
  },
  {
    id: "what-you-send",
    title: "What you send us",
    body: (
      <p>
        When you book a demo or contact us, please make sure what you send is accurate and yours to share. Our{" "}
        <Link href="/privacy">Privacy Policy</Link> explains how we handle it. If you send us ideas or feedback, we
        may use them without any obligation to you.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "Other websites",
    body: (
      <p>
        The site links to websites and services we do not run, such as social networks, event organisers and AI
        assistants. We are not responsible for their content, availability or policies.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Changes to the site",
    body: (
      <p>
        We work to keep the site available and accurate, but we may change, suspend or remove any part of it at any
        time, and we do not promise that it will always be available, error-free or up to date.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our liability",
    body: (
      <>
        <p>
          The site is provided &ldquo;as is&rdquo;. As far as the law allows, we exclude all warranties about it, and
          we are not liable for any loss arising from your use of the site or your reliance on its content, including
          indirect loss, or loss of profit, revenue, data or goodwill.
        </p>
        <p>
          Nothing in these terms limits any liability that cannot be limited by law, such as liability for fraud, or
          for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  ...(COMPANY.governingLaw
    ? [
        {
          id: "governing-law",
          title: "Governing law",
          body: (
            <p>
              These terms are governed by {COMPANY.governingLaw.law}. Any dispute about them will be decided by{" "}
              {COMPANY.governingLaw.courts}, unless the law where you live gives you the right to bring it elsewhere.
            </p>
          ),
        },
      ]
    : []),
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <>
        <p>
          We may update these terms from time to time. The date at the top shows the latest version, and the version
          on this page when you use the site is the one that applies.
        </p>
        <p>Questions about these terms? Email {mail}.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title={<>Terms &amp; Conditions</>}
      updated={LEGAL_UPDATED}
      intro={
        <p>
          The rules for using this website. They are short and in plain words. How we handle your data is in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      }
      summary={[
        <>
          <strong>This site is information.</strong> Our platform and services come with their own agreements.
        </>,
        <>
          <strong>It isn&apos;t legal advice.</strong> Check the official texts and take advice before you act.
        </>,
        <>
          <strong>Use it fairly.</strong> Don&apos;t break it, misuse it or copy it in bulk.
        </>,
        <>
          <strong>Our content is ours.</strong> Share and quote with credit; ask us for anything more.
        </>,
      ]}
      sections={SECTIONS}
    />
  );
}
