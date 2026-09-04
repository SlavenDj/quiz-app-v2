import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Backwards-compatible alias: old `ButtonVariant` was "primary" | "outline" | "danger". */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Stretch to full width of container. */
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  icon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all outline-none select-none " +
  "focus-visible:ring-4 focus-visible:ring-brand-nav/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "active:scale-[0.99]";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-[36px] rounded-lg px-3 py-1.5 text-[13px]",
  md: "min-h-[44px] rounded-xl px-4 py-2 text-sm",
  lg: "min-h-[48px] rounded-2xl px-6 py-3.5 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-nav text-white shadow-md hover:bg-brand-quiz dark:bg-brand-nav dark:hover:bg-brand-quiz",
  secondary:
    "bg-brand-muted/20 text-brand-quiz hover:bg-brand-muted/30 dark:bg-zinc-800 dark:text-fuchsia-300 dark:hover:bg-zinc-700",
  outline:
    "border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 " +
    "dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 " +
    // brand-tinted outline (used for "Uredi", "Prikaži") — applied via className override where needed
    "",
  ghost:
    "bg-transparent text-brand-quiz hover:bg-brand-muted/20 dark:text-fuchsia-300 dark:hover:bg-zinc-800",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
};

/** Brand-tinted outline for links like "← Nazad" / "Pogledaj kvizove" (finished state). */
export const outlineBrandClass =
  "border-brand-quiz/40 text-brand-quiz hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = ""
): string {
  return cn(base, sizes[size], variants[variant], extra);
}

function SpinnerDot({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(className, "animate-spin")} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={cn(buttonClasses(variant, size), fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? <SpinnerDot /> : icon}
      {children}
    </button>
  );
}
