type BadgeTone = "locked" | "progress" | "success" | "danger" | "brand" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  locked: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400",
  progress: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  brand: "bg-brand-muted/25 text-brand-quiz dark:text-fuchsia-300",
  neutral: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

/** Map module status strings to badge tones. */
export function statusTone(status: string): BadgeTone {
  if (status === "Finished") return "success";
  if (status === "InProgress") return "progress";
  return "locked";
}
