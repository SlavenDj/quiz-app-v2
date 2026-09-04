import type { ReactNode } from "react";
import { cn } from "./cn";
import { Button, type ButtonProps } from "./Button";

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  actionProps,
  className = "",
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Shorthand to render a Button as the action. */
  actionProps?: ButtonProps;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-card dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <p className="text-5xl" aria-hidden>
        {icon}
      </p>
      <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-zinc-100">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p>
      )}
      {actionProps ? (
        <Button {...actionProps} className={cn("mt-5", actionProps.className)}>
          {action ?? actionProps.children}
        </Button>
      ) : action ? (
        <div className="mt-5">{action}</div>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "Nešto nije uredu",
  description,
  retryLabel = "Pokušaj ponovo",
  onRetry,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-card dark:border-red-900 dark:bg-zinc-900",
        className
      )}
    >
      <p className="text-4xl" aria-hidden>
        😕
      </p>
      <p className="mt-2 font-semibold text-gray-900 dark:text-zinc-100">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p>
      )}
      {onRetry && (
        <Button variant="danger" size="md" onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
