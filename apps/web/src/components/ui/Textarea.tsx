import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { Field } from "./Field";

export const TEXTAREA_CLASS =
  "min-h-[88px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 text-sm font-medium text-gray-900 outline-none transition-all " +
  "placeholder:font-normal placeholder:text-gray-400 hover:bg-gray-50 " +
  "focus:border-brand-nav focus:bg-white focus:ring-4 focus:ring-brand-nav/15 " +
  "dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:bg-zinc-800 dark:focus:bg-zinc-900 dark:focus:border-brand-nav";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Optional character counter, e.g. { value: bio.length, max: 250 }. */
  counter?: { value: number; max: number };
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, counter, className = "", ...props },
  ref
) {
  const control = (
    <textarea
      id={id}
      ref={ref}
      aria-invalid={Boolean(error) || undefined}
      className={cn(
        TEXTAREA_CLASS,
        error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800" : "",
        className
      )}
      {...props}
    />
  );

  if (!label && !hint && !error && !counter)
    return control;

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {label && counter && (
        <span className="sr-only">
          {counter.value} od {counter.max}
        </span>
      )}
      {control}
      {counter && !error && (
        <span className="block text-right text-[11px] font-medium text-gray-400" aria-live="polite">
          {counter.value} / {counter.max}
        </span>
      )}
    </Field>
  );
});
