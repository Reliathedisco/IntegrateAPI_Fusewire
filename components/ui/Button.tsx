import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-medium tracking-tight whitespace-nowrap transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm/5",
  md: "px-5 py-2.5 text-sm/5",
  lg: "px-7 py-3.5 text-base/5",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper shadow-xs hover:bg-ink-soft hover:-translate-y-px hover:shadow-sm",
  secondary:
    "bg-card text-ink border border-line-strong hover:border-ink/30 hover:-translate-y-px",
  ghost:
    "bg-transparent text-mute border border-line hover:text-ink hover:border-line-strong",
  accent:
    "bg-accent text-white shadow-xs hover:bg-accent-hover hover:-translate-y-px hover:shadow-sm",
  danger:
    "bg-card text-danger border border-danger/30 hover:bg-danger/5",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = BaseProps & {
  href: string;
  external?: boolean;
};

export function LinkButton({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
}: LinkButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
