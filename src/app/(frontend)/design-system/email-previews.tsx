import { render } from "@react-email/components";
import content from "@/content/demo.json";
import { DemoConfirmationEmail } from "@/emails/demo-confirmation";
import { DemoNotificationEmail } from "@/emails/demo-notification";
import type { DemoRequest } from "@/lib/demo-request";

/** Obviously sample details, for previews only (never sent). */
const SAMPLE: DemoRequest = {
  name: "Alex Morgan",
  email: "alex@example.com",
  company: "Example Company",
  // Ofcom reserves 020 7946 0xxx for drama and fiction: a real-looking number that reaches no one
  phone: "+442079460000",
  frameworks: [content.form.frameworks[0], content.form.frameworks[1], content.form.frameworks[4]],
  notes: "We run a handful of models in production and a few agents in pilot.",
};

/**
 * Both Book a demo emails, rendered to HTML by the real templates and shown in sandboxed frames.
 * siteUrl is "" so the logo and links resolve against this site (a srcdoc frame shares the page's
 * address); sent emails use the absolute SITE_URL.
 */
export async function EmailPreviews() {
  const [confirmation, notification] = await Promise.all([
    render(<DemoConfirmationEmail request={SAMPLE} agenda={content.form.agenda} siteUrl="" />),
    render(
      <DemoNotificationEmail request={SAMPLE} submittedAt="The time the request arrives, in UTC" siteUrl="" />,
    ),
  ]);

  const frames = [
    { title: "To the visitor: thank you", html: confirmation },
    { title: "To the team: new request", html: notification },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {frames.map((f) => (
        <figure key={f.title} className="flex flex-col gap-3">
          <figcaption className="type-h4 text-fg">{f.title}</figcaption>
          <iframe
            title={`Email preview: ${f.title}`}
            srcDoc={f.html}
            sandbox="allow-same-origin"
            className="h-[70rem] w-full rounded-panel border border-line-strong bg-canvas"
          />
        </figure>
      ))}
    </div>
  );
}
