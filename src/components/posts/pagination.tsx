import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { cn } from "@/lib/utils";

/** Page 1 lives at the section's own address; later pages at /blog/page/2 and so on */
export const pageHref = (basePath: string, page: number) => (page <= 1 ? basePath : `${basePath}/page/${page}`);

/** 1 … 4 5 6 … 12: the first, the last, and the current page with its neighbours */
function pageItems(current: number, total: number): (number | "gap")[] {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const items: (number | "gap")[] = [];
  for (let page = 1; page <= total; page++) {
    if (keep.has(page)) items.push(page);
    else if (items[items.length - 1] !== "gap") items.push("gap");
  }
  return items;
}

const pill =
  "tap-target inline-flex items-center justify-center gap-1.5 rounded-control px-3 text-sm font-semibold tabular-nums transition-colors duration-200";

export function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={pageHref(basePath, page - 1)} rel="prev" className={cn(pill, "text-fg-muted hover:bg-white/[0.06] hover:text-fg")}>
          <CaretLeft aria-hidden weight="bold" className="size-4" />
          Previous
        </Link>
      )}
      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-fg-subtle">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(basePath, item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              pill,
              item === page
                ? "border border-line-strong bg-white/[0.08] text-fg"
                : "text-fg-muted hover:bg-white/[0.06] hover:text-fg",
            )}
          >
            {item}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={pageHref(basePath, page + 1)} rel="next" className={cn(pill, "text-fg-muted hover:bg-white/[0.06] hover:text-fg")}>
          Next
          <CaretRight aria-hidden weight="bold" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
