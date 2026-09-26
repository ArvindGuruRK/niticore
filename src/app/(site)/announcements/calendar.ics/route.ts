import content from "@/content/event.json";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const { event } = content;

// iCalendar text escapes commas, semicolons and backslashes.
const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`);

/**
 * /ai-everything/calendar.ics: one event per opening day (the show's own hours, in UTC), so a
 * calendar shows the stand when it is actually open. Built once at build time.
 */
export function GET() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const location = esc(`${event.venue}, stands ${event.stands}`);
  const description = esc(`Visit Niticore at stands ${event.stands}. ${SITE_URL}/ai-everything`);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Niticore//AI Everything Abu Dhabi//EN",
    "CALSCALE:GREGORIAN",
    ...event.hours.flatMap((h, i) => [
      "BEGIN:VEVENT",
      `UID:niticore-ai-everything-2026-day${i + 1}@niticore`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${h.start}`,
      `DTEND:${h.end}`,
      `SUMMARY:${esc(`Niticore at ${event.name}, day ${i + 1}`)}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      `URL:${SITE_URL}/ai-everything`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="niticore-ai-everything-abu-dhabi.ics"',
    },
  });
}
