import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Leaves draft preview and returns to the page (a path on this site only, never another origin) */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "/";
  (await draftMode()).disable();
  redirect(path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : "/");
}
