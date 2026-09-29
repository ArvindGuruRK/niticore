import Link from "next/link";
import { CookieSettingsCta } from "@/components/consent/cookie-consent";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { COMPANY, LEGAL_UPDATED } from "@/lib/company";
import { CONSENT_COOKIE, CONSENT_MAX_AGE_DAYS, COOKIE_CATEGORIES } from "@/lib/consent";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/cookies");

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

/** Every cookie the site can set today. Add a row before adding any new cookie or tracking script. */
const COOKIES = [
  {
    name: CONSENT_COOKIE,
    provider: "Niticore",
    category: "Strictly necessary",
    purpose: "Remembers the choice you save in your cookie settings. Only set once you save one.",
    duration: `${Math.round(CONSENT_MAX_AGE_DAYS / 30)} months`,
  },
  {
    name: "Security check",
    provider: "Vercel, our hosting provider",
    category: "Strictly necessary",
    purpose:
      "Set only if the site's firewall asks your browser to pass a check during a suspected attack, so you aren't checked again.",
    duration: "Short-lived",
  },
  {
    name: "payload-token",
    provider: "Niticore",
    category: "Strictly necessary",
    purpose:
      "Keeps members of our team signed in to the editor they use to publish blog and news posts. Only set for people who sign in there; visitors never get it.",
    duration: "8 hours",
  },
  {
    name: "__prerender_bypass",
    provider: "Niticore",
    category: "Strictly necessary",
    purpose:
      "Lets a signed-in member of our team preview a blog or news post before it is published. Only set when they open a preview.",
    duration: "Until the browser is closed",
  },
];

function CookieCard({ cookie }: { cookie: (typeof COOKIES)[number] }) {
  const rows = [
    ["Set by", cookie.provider],
    ["Type", cookie.category],
    ["Purpose", cookie.purpose],
    ["Kept for", cookie.duration],
  ];
  return (
    <div className="rounded-field border border-line bg-surface p-4 sm:p-5">
      <p className="break-all font-mono text-sm font-semibold text-fg">{cookie.name}</p>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-[6rem_1fr] sm:gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="type-caption pt-0.5 font-semibold">{label}</dt>
            <dd className="type-small mb-2 sm:mb-0">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: "what-cookies-are",
    title: "What cookies are",
    body: (
      <p>
        Cookies are small text files a website saves in your browser, so it can remember something between pages or
        visits. Similar technologies, such as local storage and tracking pixels, work in much the same way. In this
        policy, &ldquo;cookies&rdquo; covers all of them.
      </p>
    ),
  },
  {
    id: "how-we-use-cookies",
    title: "How we use cookies",
    body: (
      <>
        <p>
          We keep cookies to a minimum. Today the site only uses cookies that are <strong>strictly necessary</strong>
          : to remember your cookie choice, to keep the site secure, and to keep our team signed in to the editor
          they publish blog and news posts with. They don&apos;t track you across other
          websites, and the law doesn&apos;t require consent for them.
        </p>
        <p>
          We don&apos;t use analytics or advertising cookies. If we ever add them, they will stay off until you allow
          them.
        </p>
      </>
    ),
  },
  {
    id: "cookies-we-use",
    title: "The cookies we use",
    body: (
      <div className="flex flex-col gap-3">
        {COOKIES.map((cookie) => (
          <CookieCard key={cookie.name} cookie={cookie} />
        ))}
      </div>
    ),
  },
  {
    id: "categories",
    title: "Cookie categories",
    body: (
      <>
        <p>Your cookie settings group cookies into three categories:</p>
        <ul>
          {COOKIE_CATEGORIES.map((c) => (
            <li key={c.id}>
              <strong>{c.title}</strong>: {c.body}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices",
    body: (
      <>
        <p>
          You can change your mind at any time. Open your cookie settings here, or with the &ldquo;Cookie
          settings&rdquo; link at the bottom of every page.
        </p>
        <div>
          <CookieSettingsCta />
        </div>
        <p>
          You can also block or delete cookies in your browser&apos;s settings. If you block strictly necessary
          cookies, the site can&apos;t remember the choice you save in your cookie settings.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We will update this policy, and the date at the top, before we add or change any cookie. How we handle
          personal data in general is in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>Questions about cookies? Email {mail}.</p>
      </>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title={<>Cookie Policy</>}
      updated={LEGAL_UPDATED}
      intro={<p>Which cookies this website uses, why, and how to change your choice at any time.</p>}
      summary={[
        <>
          <strong>Only what&apos;s needed.</strong> Our cookies remember your cookie choice and keep the site secure.
        </>,
        <>
          <strong>No tracking.</strong> No analytics or advertising cookies, and none would run without your OK.
        </>,
        <>
          <strong>Your call.</strong> Change your cookie settings from the footer of any page.
        </>,
      ]}
      sections={SECTIONS}
    />
  );
}
