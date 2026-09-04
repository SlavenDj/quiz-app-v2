import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEditions, useModules } from "./api";
import { Badge, statusTone } from "../../components/ui/Badge";
import { Button, buttonClasses, outlineBrandClass } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { useCountdown } from "../../lib/useCountdown";

interface Module {
  id: number;
  name: string;
  shortDesc: string | null;
  editionLabel: string;
  moduleNumber: number;
  startAt: string | null;
  status: string;
  totalQuizzes: number;
}

/* ── helpers ─────────────────────────────────────────────── */

const COVERS = [
  "from-brand-nav via-[#9c3fc7] to-brand-quiz",
  "from-violet-600 via-fuchsia-500 to-amber-400",
  "from-sky-600 via-indigo-500 to-violet-500",
  "from-emerald-600 via-teal-500 to-sky-400",
  "from-rose-500 via-orange-400 to-amber-300",
  "from-indigo-600 via-brand-quiz to-fuchsia-400",
];

function coverFor(n: number) {
  return COVERS[Math.abs(n) % COVERS.length];
}

const STATUS_LABEL: Record<string, string> = {
  InProgress: "Aktivno",
  Locked: "Zaključano",
  Finished: "Završeno",
};

function Icon({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ModuleCountdown({ startAt }: { startAt: string }) {
  const left = useCountdown(startAt);
  if (!left) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-xs tabular-nums text-gray-500 dark:text-zinc-400">
      <Icon className="h-3.5 w-3.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </Icon>
      Otključava se za {left}
    </p>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Učitavanje modula">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="h-24 animate-pulse bg-gradient-to-r from-brand-muted/30 to-fuchsia-100 dark:from-zinc-800 dark:to-zinc-800" />
          <div className="p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
            <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
            <div className="mt-4 h-11 animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── main ────────────────────────────────────────────────── */

export function ModuleGrid() {
  const [edition, setEdition] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const { data: editions } = useEditions();
  const { data, isLoading, error, refetch, isFetching } = useModules(edition);

  const modules: Module[] = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!q) return true;
      return `${m.name} ${m.shortDesc ?? ""} modul ${m.moduleNumber}`.toLowerCase().includes(q);
    });
  }, [modules, query, status]);

  const stats = useMemo(
    () => ({
      modules: modules.length,
      quizzes: modules.reduce((s, m) => s + (m.totalQuizzes ?? 0), 0),
      active: modules.filter((m) => m.status === "InProgress").length,
    }),
    [modules]
  );

  const hasFilters = Boolean(query.trim() || edition || status !== "all");
  const reset = () => {
    setQuery("");
    setEdition(undefined);
    setStatus("all");
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="overflow-hidden rounded-2xl border border-brand-muted/40 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-1.5 bg-gradient-to-r from-brand-nav via-fuchsia-400 to-amber-300" aria-hidden />
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz text-white shadow-md"
            >
              <Icon className="h-7 w-7">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
                <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
              </Icon>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-quiz dark:text-fuchsia-300">
                {edition ? `Edicija · ${edition}` : "Sve edicije"}
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
                Moduli
              </h1>
              <p className="mt-1 max-w-lg text-sm text-gray-500 dark:text-zinc-400">
                Biraj modul, rješavaj kvizove i skupljaj bodove — računa se samo prvi pokušaj.
              </p>
            </div>
          </div>
          <Link
            to="/leaderboard"
            className="group flex shrink-0 items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz p-4 pr-5 text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur">
              🏆
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                Takmičenje
              </span>
              <span className="block text-sm font-bold">Pogledaj rang listu →</span>
            </span>
          </Link>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/60 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/50">
          {[
            { label: "Modula", value: String(stats.modules) },
            { label: "Kvizova", value: String(stats.quizzes) },
            { label: "Aktivnih", value: String(stats.active) },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center sm:text-left">
              <dd className="text-lg font-extrabold tabular-nums text-gray-900 dark:text-zinc-100">{s.value}</dd>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">{s.label}</dt>
            </div>
          ))}
        </dl>
      </header>

      {/* ── Filters ────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-muted/40 bg-white p-3 shadow-card dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          placeholder="Pretraži module..."
          aria-label="Pretraži module"
        />
        <div className="flex gap-2">
          <Select
            value={edition ?? ""}
            onChange={(e) => setEdition(e.target.value || undefined)}
            className="min-h-[40px] flex-1 sm:flex-none"
            aria-label="Edicija"
          >
            <option value="">Sve edicije</option>
            {(editions ?? []).map((ed: string) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="min-h-[40px]"
            aria-label="Status modula"
          >
            <option value="all">Svi statusi</option>
            <option value="InProgress">Aktivni</option>
            <option value="Locked">Zaključani</option>
            <option value="Finished">Završeni</option>
          </Select>
          {hasFilters && (
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </div>
      {isFetching && !isLoading && (
        <p className="mt-1 text-xs text-gray-400" role="status">
          Osvježavanje…
        </p>
      )}

      {/* ── Content ────────────────────────────────────── */}
      <div className="mt-4">
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState
            title="Nismo mogli učitati module"
            description={(error as Error).message}
            retryLabel="Pokušaj ponovo"
            onRetry={() => refetch()}
          />
        ) : modules.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Nema dostupnih modula"
            description={
              edition ? `Za ediciju „${edition}“ još nema modula.` : "Moduli će se pojaviti uskoro."
            }
            action={
              edition ? (
                <Button variant="outline" onClick={() => setEdition(undefined)}>
                  Prikaži sve edicije
                </Button>
              ) : undefined
            }
            className="border-dashed border-brand-muted"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={`Nema modula za „${query}“`}
            description="Provjeri pravopis ili poništi filtere."
            action={
              <Button variant="outline" onClick={reset}>
                Poništi filtere
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              {hasFilters ? `Rezultati (${filtered.length})` : `Svi moduli (${filtered.length})`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => {
                const locked = m.status === "Locked";
                const finished = m.status === "Finished";
                return (
                  <article
                    key={m.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* cover */}
                    <div className={`relative h-24 bg-gradient-to-br ${coverFor(m.moduleNumber)}`} aria-hidden>
                      <div className="absolute -left-8 -top-12 h-32 w-32 rounded-full bg-white/15" />
                      <div className="absolute -bottom-10 right-10 h-28 w-28 rounded-full bg-white/10" />
                      <span className="absolute left-4 top-3 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur">
                        Modul {m.moduleNumber}
                      </span>
                      <span className="absolute bottom-0 right-3 select-none text-7xl font-black leading-[0.85] text-white/25">
                        {m.moduleNumber}
                      </span>
                    </div>
                    {/* body */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                      <h2 className="break-words text-[17px] font-bold leading-snug text-gray-900 dark:text-zinc-100">
                        {m.name}
                      </h2>
                      {m.shortDesc ? (
                        <p className="line-clamp-2 min-w-0 break-words text-sm text-gray-500 dark:text-zinc-400">{m.shortDesc}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(m.status)}>{STATUS_LABEL[m.status] ?? m.status}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-gray-500 dark:text-zinc-400">
                          <Icon className="h-3.5 w-3.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                          </Icon>
                          {m.totalQuizzes} {m.totalQuizzes === 1 ? "kviz" : "kviza"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-zinc-500">· {m.editionLabel}</span>
                      </div>
                      <div className="mt-auto pt-3">
                        {locked ? (
                          <div className="flex flex-col items-stretch gap-1.5">
                            <span className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 dark:bg-zinc-800 dark:text-zinc-500">
                              <Icon className="h-4 w-4">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </Icon>
                              Zaključano
                            </span>
                            {m.startAt ? <ModuleCountdown startAt={m.startAt} /> : null}
                          </div>
                        ) : (
                          <Link
                            to={`/modules/${m.id}`}
                            aria-label={`${finished ? "Pogledaj" : "Otvorij"} modul ${m.moduleNumber}: ${m.name}`}
                            className={
                              finished
                                ? `${buttonClasses("outline", "md", `w-full ${outlineBrandClass}`)}`
                                : `${buttonClasses("primary", "md", "w-full")}`
                            }
                          >
                            {finished ? "Pogledaj kvizove" : "Pogledaj kvizove →"}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
