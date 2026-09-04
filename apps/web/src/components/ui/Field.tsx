import type { ReactNode } from "react";
import { cn } from "./cn";

export const FIELD_LABEL =
  "block text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-zinc-300";

/**
 * Field — label + control + hint/error wrapper.
 * Standardises the "Lični podaci" tab look across the app.
 */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  id?: string;
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

/** Icon shown inside an input on the right (decorative). */
export function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors group-focus-within:text-brand-quiz dark:group-focus-within:text-fuchsia-300"
    >
      {children}
    </div>
  );
}

/** Wraps a control with relative positioning so an icon / suffix can overlay it. */
export function FieldWrap({
  icon,
  leftSlot,
  children,
  className = "",
}: {
  icon?: ReactNode;
  leftSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      {children}
      {leftSlot}
      {icon ? <FieldIcon>{icon}</FieldIcon> : null}
    </div>
  );
}
