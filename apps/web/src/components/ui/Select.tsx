import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "./cn";
import { Field } from "./Field";

export const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-3.5 pr-9 text-sm font-medium text-gray-900 outline-none transition-all " +
  "hover:bg-gray-50 focus:border-brand-nav focus:bg-white focus:ring-4 focus:ring-brand-nav/15 " +
  "dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-900 dark:focus:border-brand-nav";

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, required, hint, error, id, className = "", children, ...props },
  ref
) {
  const control = (
    <div className="group relative">
      <select
        id={id}
        ref={ref}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          SELECT_CLASS,
          error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-800" : "",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors group-focus-within:text-brand-quiz dark:group-focus-within:text-fuchsia-300"
      >
        <Chevron />
      </div>
    </div>
  );

  if (!label && !hint && !error) return control;
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      {control}
    </Field>
  );
});
