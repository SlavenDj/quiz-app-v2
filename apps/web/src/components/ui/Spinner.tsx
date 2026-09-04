export function Spinner({ label = "Ucitavanje..." }: { label?: string }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 py-8 text-center text-gray-500 dark:text-zinc-400">
      <span aria-hidden className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-muted border-t-brand-quiz" />
      {label}
    </p>
  );
}
