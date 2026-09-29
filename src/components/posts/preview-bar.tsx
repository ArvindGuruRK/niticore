import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";

/**
 * Shown only to signed-in editors who opened a post with the CMS's Preview button: a pill pinned to
 * the bottom of the screen saying this is the saved draft, with a way back to the live page.
 */
export function PreviewBar({ path, status }: { path: string; status: "draft" | "published" }) {
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[max(1rem,var(--safe-bottom))] z-[var(--z-nav)] flex justify-center px-page"
    >
      <div className="flex items-center gap-3 rounded-control border border-line-strong bg-raised py-1.5 pl-4 pr-1.5 shadow-panel">
        <Eye aria-hidden weight="duotone" className="size-5 shrink-0 text-tertiary" />
        <p className="type-small text-fg">
          {status === "published" ? "Previewing your latest saved changes" : "Previewing a draft"}
        </p>
        <a
          href={`/cms-preview/exit?path=${encodeURIComponent(path)}`}
          className="tap-target inline-flex items-center rounded-control border border-line-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-white/[0.08]"
        >
          Exit preview
        </a>
      </div>
    </div>
  );
}
