import type { ReactNode } from "react";
import { cn } from "./cn";

export type AlertTone = "error" | "success" | "info" | "warning";

const tones: Record<AlertTone, string> = {
  error:
    "bg-red-50 text-status-danger ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-900",
  success:
    "bg-green-50 text-status-success ring-green-200 dark:bg-green-950 dark:text-green-400 dark:ring-green-900",
  info: "bg-brand-muted/15 text-brand-quiz ring-brand-muted/40 dark:text-fuchsia-300 dark:ring-zinc-700",
  warning:
    "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
};

export function Alert({
  tone = "error",
  children,
  className = "",
}: {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md px-3 py-2 text-sm ring-1", tones[tone], className)}
    >
      {children}
    </p>
  );
}
