import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

export type ChoiceSize = "sm" | "md";

export const CHOICE_BOX_SIZES: Record<ChoiceSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
};

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  size?: ChoiceSize;
}

/**
 * Custom square checkbox matching the "Obavijesti" card in Lični podaci.
 * Accessible: native input is sr-only + peer, visual box is aria-hidden
 * and shows the focus ring via peer-focus-visible.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, checked, disabled, size = "md", className = "", id, ...props },
  ref
) {
  const box = (
    <span className="flex shrink-0 items-center">
      <input
        id={id}
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-md border-2 transition-all",
          "peer-focus-visible:ring-4 peer-focus-visible:ring-brand-nav/30",
          CHOICE_BOX_SIZES[size],
          checked
            ? "border-brand-nav bg-brand-nav"
            : "border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
          disabled && "opacity-50"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "text-white transition-opacity",
            size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
            checked ? "opacity-100" : "opacity-0"
          )}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    </span>
  );

  if (!label) return box;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {box}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-zinc-400">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});
