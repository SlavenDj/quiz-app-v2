import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
import { CHOICE_BOX_SIZES, type ChoiceSize } from "./Checkbox";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  size?: ChoiceSize;
}

/**
 * Custom radio matching the Checkbox kit piece (brand fill + focus ring).
 * Accessible: native input is sr-only + peer, visual circle is aria-hidden.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, checked, disabled, size = "md", className = "", id, ...props },
  ref
) {
  const circle = (
    <span className="flex shrink-0 items-center">
      <input
        id={id}
        ref={ref}
        type="radio"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-full border-2 transition-all",
          "peer-focus-visible:ring-4 peer-focus-visible:ring-brand-nav/30",
          CHOICE_BOX_SIZES[size],
          checked
            ? "border-brand-nav"
            : "border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800",
          disabled && "opacity-50"
        )}
      >
        <span
          className={cn(
            "rounded-full bg-brand-nav transition-all",
            size === "sm" ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        />
      </span>
    </span>
  );

  if (!label) return circle;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {circle}
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
