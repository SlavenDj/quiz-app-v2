export function Loading({ label = "Ucitavanje..." }: { label?: string }) {
  return <p className="py-8 text-center text-gray-500 dark:text-zinc-400">{label}</p>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-gray-500 dark:text-zinc-400">{message}</p>;
}
