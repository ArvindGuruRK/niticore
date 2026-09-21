import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
};

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<"a">, "href">)
    | ({ href?: undefined } & ComponentProps<"button">)
  );

const variants: Record<Variant, string> = {
  // Ink text on signal green: 11.7:1 contrast
  primary:
    "bg-accent text-accent-ink shadow-accent hover:bg-accent-hover hover:-translate-y-px",
  // Glass outline: bordered, tinted fill so it reads on the canvas
  secondary:
    "border border-line-strong bg-white/[0.04] text-fg backdrop-blur-md shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-white/[0.09] hover:border-white/30",
  ghost: "text-fg-muted hover:text-fg hover:bg-white/[0.06]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold",
    "transition-[transform,background-color,border-color,color] duration-300 ease-out-expo",
    "active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          weight="bold"
          aria-hidden
          className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ComponentProps<"button">)}>
      {content}
    </button>
  );
}
