import { PageHero } from "@/components/page/page-hero";
import { GetStarted } from "@/components/sections/get-started";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Frameworks",
  "One governance action, credited against the EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation at once.",
);

export default function FrameworksPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Do it once. <span data-accent="" className="inline-block text-accent">Satisfy all.</span>
          </>
        }
        lead="Every governance action is mapped and credited against each obligation it satisfies: EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation. No parallel audit trails, and governance overhead cut by more than half."
        doodles={{ left: "petal", right: "star" }}
      />
      <GetStarted
        title="Map every obligation in one pass."
        lead="See how far your current controls already reach across EU, ISO, NIST, GDPR and UAE requirements, and exactly where the gaps are."
      />
    </>
  );
}
