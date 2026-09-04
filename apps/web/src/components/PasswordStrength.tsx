const rules = [
  (p: string) => p.length >= 8,
  (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  (p: string) => /\d/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
];

const labels = ["Slaba", "Slaba", "Srednja", "Jaka", "Jaka"];

export function PasswordStrength({ password }: { password: string }) {
  const pw = password ?? "";
  const score = rules.reduce((n, r) => n + (r(pw) ? 1 : 0), 0);
  const label = pw.length === 0 ? "" : labels[score];
  const activeColor = score <= 1 ? "bg-red-500" : score === 2 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded ${i < score ? activeColor : "bg-gray-200 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
      {label && <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">{label}</p>}
    </div>
  );
}
