import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, statusTone } from "../../components/ui/Badge";
import { Button, buttonClasses } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";

interface QuizRow {
  quizId: number;
  quizName: string;
  description: string | null;
  timeLimitSec: number | null;
  maxAttempts: number;
  questionCount: number;
  myAttempts: number;
  canAttempt: boolean;
  lastScore: number | null;
}

interface ModuleDetailData {
  id: number;
  name: string;
  shortDesc: string | null;
  longDesc: string | null;
  editionLabel: string;
  moduleNumber: number;
  status: string;
  quizzes: QuizRow[];
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
  return COVERS[Math.abs(n ?? 0) % COVERS.length];
}

const STATUS_LABEL: Record<string, string> = {
  InProgress: "Aktivno",
  Locked: "Zaključano",
  Finished: "Završeno",
};

function fmtTime(sec: number | null) {
  if (sec == null) return "bez limita";
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}

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

type SortKey = "available" | "name" | "score" | "attempts";

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-label="Učitavanje modula">
      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100">
        <div className="h-28 animate-pulse bg-gradient-to-r from-brand-muted/30 to-fuchsia-100" />
        <div className="p-5">
          <div className="h-7 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-card ring-1 ring-gray-100" />
        ))}
      </div>
    </div>
  );
}

/* ── main ────────────────────────────────────────────────── */

export function ModuleDetail() {
  const { id } = useParams();
  const numericId = Number(id);
  const idValid = id !== undefined && id !== "" && !Number.isNaN(numericId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("available");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["module", numericId],
    queryFn: () => api(`/api/modules/${numericId}`) as Promise<ModuleDetailData>,
    enabled: idValid,
    retry: 1,
  });

  const quizzes: QuizRow[] = useMemo(() => (Array.isArray(data?.quizzes) ? data.quizzes : []), [data]);

  const progress = useMemo(() => {
    const done = quizzes.filter((q) => q.myAttempts > 0).length;
    return { done, total: quizzes.length, pct: quizzes.length ? Math.round((done / quizzes.length) * 100) : 0 };
  }, [quizzes]);

  const playable = useMemo(
    () => quizzes.filter((q) => q.canAttempt && data?.status === "InProgress").length,
    [quizzes, data?.status]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = quizzes.filter((quiz) =>
      q ? `${quiz.quizName} ${quiz.description ?? ""}`.toLowerCase().includes(q) : true
    );
    return [...rows].sort((a, b) => {
      if (sort === "available") {
        const ap = a.canAttempt && data?.status === "InProgress" ? 0 : 1;
        const bp = b.canAttempt && data?.status === "InProgress" ? 0 : 1;
        return ap - bp || a.quizName.localeCompare(b.quizName);
      }
      if (sort === "score") return (b.lastScore ?? -1) - (a.lastScore ?? -1);
      if (sort === "attempts") return a.myAttempts - b.myAttempts;
      return a.quizName.localeCompare(b.quizName);
    });
  }, [quizzes, search, sort, data?.status]);

  if (!idValid) {
    return (
      <EmptyState
        icon="🔗"
        title="Neispravan link"
        description="Ovaj link ka modulu nije validan."
        action={
          <Link to="/home" className={buttonClasses("primary", "md")}>
            Nazad na module
          </Link>
        }
      />
    );
  }

  if (isLoading || !data) return <DetailSkeleton />;

  if (error) {
    return (
      <ErrorState
        title="Nismo mogli učitati modul"
        description={(error as Error).message}
        retryLabel={isFetching ? "Učitavanje…" : "Pokušaj ponovo"}
        onRetry={() => refetch()}
      />
    );
  }

  const active = data.status === "InProgress";
  const locked = data.status === "Locked";

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* ── Breadcrumb ── */}
      <nav aria-label="Navigacija" className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/home" className="font-medium text-brand-quiz hover:underline">
          Moduli
        </Link>
        <span aria-hidden className="text-gray-300">
          /
        </span>
        <span className="max-w-[240px] truncate font-semibold text-gray-700 sm:max-w-none">
          Modul {data.moduleNumber}: {data.name}
        </span>
      </nav>

      {/* ── Hero ── */}
      <section
        aria-label={`Modul ${data.moduleNumber}: ${data.name}`}
        className="overflow-hidden rounded-2xl border border-brand-muted/40 bg-white shadow-card"
      >
        <div className={`relative bg-gradient-to-br ${coverFor(data.moduleNumber)} px-5 pb-5 pt-6 sm:px-6`} aria-hidden={false}>
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-white/15" />
            <div className="absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-white/10" />
            <span className="absolute bottom-0 right-4 select-none text-[104px] font-black leading-[0.8] text-white/20">
              {data.moduleNumber}
            </span>
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-white backdrop-blur">
              Modul {data.moduleNumber}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {data.editionLabel}
            </span>
            <Badge tone={statusTone(data.status)}>{STATUS_LABEL[data.status] ?? data.status}</Badge>
          </div>
          <h1 className="relative mt-2 break-words text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {data.name}
          </h1>
          {data.longDesc ? (
            <p className="relative mt-1.5 max-w-2xl break-words text-sm leading-relaxed text-white/85">
              {data.longDesc}
            </p>
          ) : null}
        </div>

        {/* progress + stats */}
        <div className="p-5 sm:px-6">
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="font-bold text-gray-900">
              Napredak{" "}
              <span className="tabular-nums text-brand-quiz">
                {progress.done}/{progress.total}
              </span>
            </p>
            <p className="text-xs font-semibold tabular-nums text-gray-500">{progress.pct}%</p>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100"
            role="progressbar"
            aria-valuenow={progress.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Riješeno ${progress.done} od ${progress.total} kvizova`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-nav to-brand-quiz transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Kvizova", value: String(quizzes.length) },
              { label: "Riješeno", value: String(progress.done) },
              { label: "Za igru", value: String(playable) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-gray-50 px-3 py-2.5 text-center ring-1 ring-gray-100">
                <dd className="text-lg font-extrabold tabular-nums text-gray-900">{s.value}</dd>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{s.label}</dt>
              </div>
            ))}
          </dl>
          {locked && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="note">
              🔒 Modul je zaključan — kvizovi će biti dostupni uskoro.
            </p>
          )}
          {!locked && !active && (
            <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600" role="note">
              Modul je završen — rezultate možeš pogledati ispod, ali nova igra nije moguća.
            </p>
          )}
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-muted/40 bg-white p-3 shadow-card sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Pretraži kvizove..."
          aria-label="Pretraži kvizove"
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="min-h-[40px] sm:w-auto"
          aria-label="Sortiranje kvizova"
        >
          <option value="available">Dostupni prvo</option>
          <option value="name">Naziv A-Z</option>
          <option value="score">Najviše bodova</option>
          <option value="attempts">Najmanje pokušaja</option>
        </Select>
      </div>

      {/* ── Quiz list ── */}
      <section aria-label="Kvizovi u modulu" className="mt-3">
        <p className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-gray-500">
          {search.trim() ? `Rezultati (${visible.length})` : `Kvizovi (${visible.length})`}
        </p>
        {visible.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={`Nema kvizova za „${search}“`}
            description="Provjeri pravopis ili poništi pretragu."
            action={
              <Button variant="outline" onClick={() => setSearch("")}>
                Poništi pretragu
              </Button>
            }
          />
        ) : (
          <ol className="flex flex-col gap-2">
            {visible.map((q, i) => {
              const canPlay = q.canAttempt && active;
              const usedUp = !q.canAttempt;
              const attemptsPct = q.maxAttempts
                ? Math.min(100, Math.round((q.myAttempts / q.maxAttempts) * 100))
                : 0;
              return (
                <li key={q.quizId}>
                  <article
                    className={`flex items-center gap-3 rounded-2xl border bg-white px-3 py-3 shadow-card transition-all sm:gap-4 sm:px-4 ${
                      canPlay ? "border-gray-100 hover:-translate-y-0.5 hover:shadow-lg" : "border-gray-100"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${
                        q.myAttempts > 0 ? "bg-green-100 text-green-800" : "bg-fuchsia-100 text-brand-quiz"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="min-w-0 break-words text-[15px] font-bold text-gray-900">{q.quizName}</h3>
                        <Badge tone={canPlay ? "progress" : usedUp ? "locked" : "neutral"}>
                          {canPlay ? "Dostupno" : usedUp ? "Iskorišteno" : "Završeno"}
                        </Badge>
                      </div>
                      {q.description ? (
                        <p className="mt-0.5 line-clamp-1 min-w-0 break-words text-[13px] text-gray-500">
                          {q.description}
                        </p>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                          </Icon>
                          {q.questionCount} {q.questionCount === 1 ? "pitanje" : "pitanja"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </Icon>
                          {fmtTime(q.timeLimitSec)}
                        </span>
                        <span>
                          Pokušaji: {q.myAttempts}/{q.maxAttempts}
                        </span>
                        {q.lastScore != null && (
                          <span className="font-bold text-gray-700">Zadnji: {q.lastScore} bodova</span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1 max-w-[220px] overflow-hidden rounded-full bg-gray-100" aria-hidden>
                        <div
                          className={`h-full rounded-full ${usedUp ? "bg-gray-300" : "bg-gradient-to-r from-brand-nav to-brand-quiz"}`}
                          style={{ width: `${attemptsPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0">
                      {canPlay ? (
                        <Link
                          to={`/quiz/${q.quizId}`}
                          aria-label={`Započni kviz ${q.quizName}`}
                          className={buttonClasses("primary", "md", "sm:px-5")}
                        >
                          Započni →
                        </Link>
                      ) : (
                        <span
                          title={usedUp ? "Nema više pokušaja" : "Modul nije aktivan"}
                          className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 px-4 py-2 text-center text-xs font-semibold text-gray-400 sm:px-5 sm:text-sm"
                        >
                          {usedUp ? "Nema pokušaja" : "Nije aktivno"}
                        </span>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-3 text-center text-xs text-gray-400">
          Boduje se samo prvi pokušaj · iskoristi ga pametno
        </p>
      </section>
    </div>
  );
}
