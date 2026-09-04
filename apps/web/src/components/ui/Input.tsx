import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";
import { Field, FieldWrap } from "./Field";

export const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-3.5 pr-3.5 text-sm font-medium text-gray-900 outline-none transition-all " +
  "placeholder:font-normal placeholder:text-gray-400 hover:bg-gray-50 " +
  "focus:border-brand-nav focus:bg-white focus:ring-4 focus:ring-brand-nav/15 " +
  "dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:bg-zinc-800 dark:focus:bg-zinc-900 dark:focus:border-brand-nav";

const INPUT_ERROR_CLASS =
  "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Decorative icon on the right side of the input. */
  icon?: ReactNode;
  /** Non-interactive slot pinned to the left (e.g. "@" prefix, globe icon). */
  leftSlot?: ReactNode;
  /** Extra padding is handled automatically when slots are present. */
  withIconPadding?: boolean;
}

/**
 * Canonical text input — the "Lični podaci" style.
 * Use for text / email / password / number / datetime-local / month etc.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, required, hint, error, id, icon, leftSlot, className = "", ...props },
  ref
) {
  const input = (
    <FieldWrap icon={icon} leftSlot={leftSlot}>
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error) || undefined}
        className={cn(INPUT_CLASS, error ? INPUT_ERROR_CLASS : "", icon ? "pr-9" : "", className)}
        {...props}
      />
    </FieldWrap>
  );

  if (!label && !hint && !error) return input;
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      {input}
    </Field>
  );
});
