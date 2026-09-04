import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLeaderboard, useEditions } from "./api";
import { useAuthStore } from "../../stores/auth";
import { avatarSrc } from "../../lib/avatar";
import { Spinner } from "../../components/ui/Spinner";
import { Button, buttonClasses } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";

interface Row {
  userId: number;
  rank: number;
  firstName: string;
  lastName: string;
  username?: string | null;
  country?: string | null;
  city?: string | null;
  avatarFile: string | null;
  totalScore: number;
  totalDurationSec: number;
  quizzesPlayed: number;
}

const AVATAR_BG = [
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
];

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function bgFor(id: number) {
  return AVATAR_BG[Math.abs(id) % AVATAR_BG.length];
}

function fullName(r: Row) {
  return `${r.firstName} ${r.lastName}`.trim() || "Nepoznat igrač";
}

function location(r: Row) {
  return [r.city, r.country].filter(Boolean).join(", ");
}

function fmtDuration(totalSec: number, quizzes: number) {
  if (!quizzes) return "—";
  const avg = Math.round(totalSec / quizzes);
  if (avg < 60) return `${avg}s/kviz`;
  return `${Math.floor(avg / 60)}m ${avg % 60}s/kviz`;
}

function Avatar({ r, size }: { r: Row; size: "lg" | "md" | "sm" }) {
  const cls =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "md"
        ? "h-11 w-11 text-sm"
        : "h-9 w-9 text-xs";
  const src = avatarSrc(r.avatarFile, fullName(r));
  if (src) return <img src={src} alt="" className={`${cls} shrink-0 rounded-full object-cover ring-2 ring-white`} loading="lazy" />;
  return (
    <span
      aria-hidden
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-bold ${bgFor(r.userId)} ring-2 ring-white`}
    >
      {initials(r.firstName, r.lastName)}
    </span>
  );
}

function Crown() {
  return (
    <span aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl drop-shadow-sm">
      👑
    </span>
  );
}

const PODIUM_ART = {
  1: { glow: "#fbbf24", tint: "#fffbeb", ring: "ring-2 ring-amber-300 border-amber-200" },
  2: { glow: "#94a3b8", tint: "#f8fafc", ring: "ring-1 ring-slate-300 border-slate-200" },
  3: { glow: "#fb923c", tint: "#fff7ed", ring: "ring-1 ring-orange-200 border-orange-200" },
} as const;

function PodiumBackdrop({ place }: { place: 1 | 2 | 3 }) {
  const art = PODIUM_ART[place];
  const gid = `pg-${place}`;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={gid} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor={art.glow} stopOpacity="0.35" />
          <stop offset="55%" stopColor={art.glow} stopOpacity="0.08" />
          <stop offset="100%" stopColor={art.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="220" fill={art.tint} className="dark:fill-zinc-900" />
      <rect width="300" height="220" fill={`url(#${gid})`} />
      {/* sunburst rays */}
      {place === 1 && (
        <g stroke={art.glow} strokeWidth="2" strokeLinecap="round" opacity="0.5">
          <line x1="150" y1="-6" x2="150" y2="26" />
          <line x1="108" y1="2" x2="122" y2="30" />
          <line x1="192" y1="2" x2="178" y2="30" />
          <line x1="72" y1="22" x2="92" y2="44" />
          <line x1="228" y1="22" x2="208" y2="44" />
        </g>
      )}
      {/* confetti */}
      <g fill={art.glow}>
        <circle cx="34" cy="52" r="3.5" opacity="0.55" />
        <circle cx="266" cy="48" r="4" opacity="0.5" />
        <circle cx="52" cy="120" r="2.5" opacity="0.4" />
        <circle cx="250" cy="118" r="2.5" opacity="0.4" />
        <circle cx="24" cy="172" r="3" opacity="0.35" />
        <circle cx="278" cy="170" r="3" opacity="0.35" />
        <circle cx="96" cy="34" r="2" opacity="0.45" />
        <circle cx="206" cy="34" r="2" opacity="0.45" />
        <path d="M70 66l2.2 5.6 5.6 2.2-5.6 2.2-2.2 5.6-2.2-5.6-5.6-2.2 5.6-2.2Z" opacity="0.6" />
        <path d="M230 66l2.2 5.6 5.6 2.2-5.6 2.2-2.2 5.6-2.2-5.6-5.6-2.2 5.6-2.2Z" opacity="0.6" />
        <path d="M150 44l2.6 6.6 6.6 2.6-6.6 2.6-2.6 6.6-2.6-6.6-6.6-2.6 6.6-2.6Z" opacity="0.7" />
      </g>
      <g stroke={art.glow} strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
        <path d="M44 84h12M50 78v12" />
        <path d="M244 150h12M250 144v12" />
        <path d="M40 140h10M45 135v10" opacity="0.7" />
        <path d="M250 84h10M255 79v10" opacity="0.7" />
      </g>
      {/* laurel sprigs for the champion */}
      {place === 1 && (
        <g stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45">
          <path d="M52 190c-4-22 2-44 18-58" />
          <path d="M58 176c-6-2-10-6-11-12 6 1 10 5 11 12ZM62 162c-6-2-10-6-11-12 6 1 10 5 11 12ZM68 148c-5-3-8-8-8-14 6 2 9 7 8 14Z" fill="#d97706" stroke="none" opacity="0.5" />
          <path d="M248 190c4-22-2-44-18-58" />
          <path d="M242 176c6-2 10-6 11-12-6 1-10 5-11 12ZM238 162c6-2 10-6 11-12-6 1-10 5-11 12ZM232 148c5-3 8-8 8-14-6 2-9 7-8 14Z" fill="#d97706" stroke="none" opacity="0.5" />
        </g>
      )}
      {/* dotted arcs */}
      <g fill={art.glow} opacity="0.5">
        <circle cx="86" cy="196" r="2" />
        <circle cx="102" cy="200" r="2" />
        <circle cx="118" cy="202" r="2" />
        <circle cx="182" cy="202" r="2" />
        <circle cx="198" cy="200" r="2" />
        <circle cx="214" cy="196" r="2" />
      </g>
      {/* giant watermark number */}
      <text x="150" y="205" textAnchor="middle" fontSize="130" fontWeight="900" fill={art.glow} opacity="0.13" fontFamily="system-ui, sans-serif">
        {place}
      </text>
    </svg>
  );
}

function PodiumCard({ r, place, isMe, topScore }: { r: Row; place: 1 | 2 | 3; isMe: boolean; topScore: number }) {
  const order = place === 1 ? "sm:order-2 sm:-mt-6" : place === 2 ? "sm:order-1" : "sm:order-3";
  const badge =
    place === 1
      ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950"
      : place === 2
        ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800"
        : "bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950";
  const bar = place === 1 ? "h-14" : place === 2 ? "h-10" : "h-8";
  return (
    <Link
      to={`/userinfo/${r.userId}`}
      aria-label={`${place}. mjesto: ${fullName(r)}, ${r.totalScore} bodova`}
      className={`group relative flex min-w-0 flex-col items-center overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 px-4 pb-0 pt-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-lg ${order} ${PODIUM_ART[place].ring} ${
        isMe ? "!border-brand-nav !ring-2 !ring-brand-nav" : ""
      }`}
    >
      <PodiumBackdrop place={place} />
      {place === 1 && <Crown />}
      <span className={`relative flex h-9 w-9 items-center justify-center rounded-full text-base font-extrabold shadow-sm ${badge}`}>
        {place}
      </span>
      <div className="relative mt-3">
        <Avatar r={r} size="lg" />
      </div>
      <p className="relative mt-2 w-full truncate text-sm font-bold text-gray-900 dark:text-zinc-100">
        {fullName(r)} {isMe && <span className="ml-1 rounded-full bg-brand-nav px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase text-white">vi</span>}
      </p>
      {r.username ? <p className="relative w-full truncate text-xs text-gray-500 dark:text-zinc-400">@{r.username}</p> : null}
      <p className="relative mt-1 text-lg font-extrabold tabular-nums text-gray-900 dark:text-zinc-100">
        {r.totalScore} <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">bodova</span>
      </p>
      <p className="relative text-xs tabular-nums text-gray-500 dark:text-zinc-400">
        {r.quizzesPlayed} {r.quizzesPlayed === 1 ? "kviz" : r.quizzesPlayed % 10 === 1 ? "kviz" : "kviza"} · {fmtDuration(r.totalDurationSec, r.quizzesPlayed)}
      </p>
      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100/80 dark:bg-zinc-800/80" aria-hidden>
        <div
          className={`h-full rounded-full ${place === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500" : place === 2 ? "bg-slate-400" : "bg-orange-400"}`}
          style={{ width: `${topScore ? Math.max(8, Math.round((r.totalScore / topScore) * 100)) : 0}%` }}
        />
      </div>
      <div className={`relative mt-3 w-full rounded-t-lg ${place === 1 ? "bg-gradient-to-b from-amber-100 to-amber-50" : place === 2 ? "bg-slate-100" : "bg-orange-50"} ${bar}`} aria-hidden />
    </Link>
  );
}

export function Leaderboard() {
  const [season, setSeason] = useState("");
  const [month, setMonth] = useState("");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(20);
  const [jumpId, setJumpId] = useState<number | null>(null);
  const [flashId, setFlashId] = useState<number | null>(null);
  const { data, isLoading, error, refetch, isFetching } = useLeaderboard(season || undefined, month || undefined);
  const { data: editions } = useEditions();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const rows: Row[] = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.firstName} ${r.lastName} ${r.username ?? ""} ${r.city ?? ""} ${r.country ?? ""}`.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const stats = useMemo(() => {
    if (rows.length === 0) return { players: 0, points: 0, avg: 0, top: 0 };
    const points = rows.reduce((s, r) => s + r.totalScore, 0);
    return {
      players: rows.length,
      points,
      avg: Math.round((points / rows.length) * 10) / 10,
      top: rows[0]?.totalScore ?? 0,
    };
  }, [rows]);

  const me = useMemo(() => rows.find((r) => r.userId === currentUserId) ?? null, [rows, currentUserId]);
  const meGap = useMemo(() => {
    if (!me || me.rank <= 1) return null;
    const above = rows.find((r) => r.rank === me.rank - 1);
    if (!above) return null;
    return { diff: above.totalScore - me.totalScore, name: fullName(above) };
  }, [me, rows]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3, visible);
  const hasFilters = Boolean(season || month || query.trim());

  // "Skoči na mene": proširi listu dok se moj red ne iscrta, pa skroluj na njega i nakratko ga istakni.
  const jumpToMe = () => {
    if (!me) return;
    setVisible((v) => Math.max(v, me.rank));
    setJumpId(me.userId);
  };
  useEffect(() => {
    if (jumpId == null) return;
    const el = document.getElementById(`lb-row-${jumpId}`);
    if (!el) return; // red još nije iscrtan (lista se širi) — pokušaj ponovo nakon sljedećeg rendera
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setJumpId(null);
    setFlashId(jumpId);
    const t = setTimeout(() => setFlashId(null), 2200);
    return () => clearTimeout(t);
  });

  if (isLoading) return <Spinner label="Učitavanje rang liste..." />;
  if (error)
    return (
      <div className="page-container">
        <ErrorState
          title="Nismo mogli učitati rang listu"
          description={(error as Error).message}
          retryLabel="Pokušaj ponovo"
          onRetry={() => refetch()}
        />
      </div>
    );

  return (
    <div className="page-container">
      {/* ── Header ───────────────────────────────────────── */}
      <header className="overflow-hidden rounded-2xl border border-brand-muted/40 bg-white dark:bg-zinc-900 shadow-card">
        <div className="h-1.5 bg-gradient-to-r from-brand-nav via-fuchsia-400 to-amber-300" aria-hidden />
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
                <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 2 4.5 4.5 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-2 4.5-4.5 4.5" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-quiz dark:text-fuchsia-300">
                Takmičenje · sezona {season || "sve"} {month ? `· ${month}` : ""}
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Rang lista</h1>
              <p className="mt-1 max-w-lg text-sm text-gray-500 dark:text-zinc-400">
                Boduju se samo prvi pokušaji. Prestigni igrača iznad sebe i popni se prema tronu.
              </p>
            </div>
          </div>
          <Link
            to={me ? `/userinfo/${me.userId}` : "/profile"}
            className="group flex shrink-0 items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz p-4 pr-5 text-white shadow-md transition-transform hover:-translate-y-0.5 lg:min-w-[240px]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-extrabold tabular-nums backdrop-blur">
              {me ? me.rank : "—"}
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                {me ? "Tvoj rang" : "Nisi rangiran"}
              </span>
              <span className="block text-sm font-bold">
                {me ? `${me.totalScore} bodova · ${me.quizzesPlayed} kviza` : "Odigraj kviz za ulazak"}
              </span>
              {me && meGap ? (
                <span className="mt-0.5 block text-xs text-white/80">još {meGap.diff} {meGap.diff === 1 ? "bod" : "bodova"} do #{me.rank - 1} →</span>
              ) : me ? (
                <span className="mt-0.5 block text-xs text-white/80">držiš vrh, svaka čast →</span>
              ) : null}
            </span>
          </Link>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-zinc-800 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60 sm:grid-cols-4">
          {[
            {
              label: "Igrača na listi",
              value: String(stats.players),
              icon: <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
            },
            {
              label: "Bodova ukupno",
              value: String(stats.points),
              icon: <path d="M12 2l2.9 6.26 6.6.57-5 4.4 1.5 6.47L12 16.9 5.99 19.7l1.5-6.47-5-4.4 6.6-.57L12 2Z" />,
            },
            {
              label: "Prosjek po igraču",
              value: String(stats.avg),
              icon: <path d="M3 3v18h18M7 15l4-6 4 3 4-8" />,
            },
            {
              label: "Lider",
              value: rows[0] ? `${fullName(rows[0]).split(" ").map((w, i) => (i === 0 ? w : `${w[0]}.`)).join(" ")} · ${rows[0].totalScore}` : "—",
              icon: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />,
            },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-3">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-muted/20 text-brand-quiz dark:text-fuchsia-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                  {s.icon}
                </svg>
              </span>
              <span className="min-w-0">
                <dd className="truncate text-base font-extrabold tabular-nums text-gray-900 dark:text-zinc-100">{s.value}</dd>
                <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">{s.label}</dt>
              </span>
            </div>
          ))}
        </dl>
      </header>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-gray-50/95 dark:bg-zinc-950/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-2 rounded-2xl border border-brand-muted/40 bg-white dark:bg-zinc-900 p-3 shadow-card sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(20); }}
            onClear={() => setQuery("")}
            placeholder="Pretraži igrača, grad..."
            aria-label="Pretraži igrače"
          />
          <div className="flex gap-2">
            <Select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="min-h-[40px] flex-1 sm:flex-none"
              aria-label="Sezona"
            >
              <option value="">Sve sezone</option>
              {(Array.isArray(editions) ? editions : []).map((e: string) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Select>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="min-h-[40px] w-auto"
              aria-label="Mjesec"
            />
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => { setSeason(""); setMonth(""); setQuery(""); }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        {isFetching && <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500" role="status">Osvježavanje...</p>}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="🚀"
          title="Još nema rezultata"
          description="Budi prvi na tabeli — odigraj kviz i tvoji bodovi iz prvog pokušaja pojavit će se ovdje."
          action={
            <Link to="/home" className={buttonClasses("primary", "md")}>
              Igraj kviz
            </Link>
          }
          className="mt-6 border-dashed border-brand-muted"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`Nema igrača za “${query}”`}
          description="Provjeri pravopis ili resetuj filtere."
          action={
            <Button variant="outline" onClick={() => { setQuery(""); setSeason(""); setMonth(""); }}>
              Poništi filtere
            </Button>
          }
          className="mt-6"
        />
      ) : (
        <>
          {/* ── Podium ─────────────────────────────────── */}
          {!query.trim() && (
            <section aria-label="Top 3 igrača" className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                {top3.map((r, i) => (
                  <PodiumCard key={r.userId} r={r} place={(i + 1) as 1 | 2 | 3} isMe={r.userId === currentUserId} topScore={stats.top} />
                ))}
              </div>
            </section>
          )}

          {/* ── My position (neighbourhood anchor) ─────── */}
          {me && !query.trim() && me.rank > 3 && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl border-2 border-brand-nav bg-gradient-to-r from-fuchsia-50 to-violet-50 p-3 shadow-card dark:from-fuchsia-950/70 dark:to-violet-950/70 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar r={me} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-zinc-100">
                    Tvoja pozicija: <span className="tabular-nums text-brand-quiz dark:text-fuchsia-300">#{me.rank}</span>
                    <span className="ml-2 rounded-full bg-brand-nav px-2 py-0.5 text-[10px] font-bold uppercase text-white">vi</span>
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {me.totalScore} bodova · {me.quizzesPlayed} kviza
                    {meGap ? ` · još ${meGap.diff} ${meGap.diff === 1 ? "bod" : "bodova"} do #${me.rank - 1} (${meGap.name})` : " · držiš vrh! 👑"}
                  </p>
                </div>
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white dark:bg-zinc-900 sm:max-w-[180px]" aria-hidden>
                <div className="h-full rounded-full bg-gradient-to-r from-brand-nav to-brand-quiz" style={{ width: `${stats.top ? Math.max(6, Math.round((me.totalScore / stats.top) * 100)) : 0}%` }} />
              </div>
            </div>
          )}

          {/* ── Full table ─────────────────────────────── */}
          <section aria-label="Svi rangirani igrači" className="mt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                {query.trim() ? `Rezultati (${filtered.length})` : `Tabela · top ${filtered.length}`}
              </h2>
              {me && me.rank > 3 && !query.trim() && (
                <button onClick={jumpToMe} className="text-xs font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
                  ↓ skoči na mene
                </button>
              )}
            </div>
            <ol className="flex flex-col gap-2">
              {(query.trim() ? filtered.slice(0, visible) : rest).map((r) => {
                const isMe = r.userId === currentUserId;
                const pct = stats.top ? Math.max(4, Math.round((r.totalScore / stats.top) * 100)) : 0;
                const above = rows.find((x) => x.rank === r.rank - 1);
                const gap = above && r.rank > 1 ? above.totalScore - r.totalScore : null;
                return (
                  <li key={r.userId} id={`lb-row-${r.userId}`} className="scroll-mt-32">
                    <Link
                      to={`/userinfo/${r.userId}`}
                      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg sm:px-4 ${
                        isMe ? "!border-brand-nav ring-2 ring-brand-nav" : "border-gray-100 dark:border-zinc-800"
                      } ${flashId === r.userId ? "!border-brand-nav ring-4 ring-brand-nav/40" : ""}`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tabular-nums ${
                          r.rank === 1
                            ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950"
                            : r.rank === 2
                              ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800"
                              : r.rank === 3
                                ? "bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950"
                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                        }`}
                      >
                        {r.rank}
                      </span>
                      <Avatar r={r} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-gray-900 dark:text-zinc-100">{fullName(r)}</span>
                          {isMe && (
                            <span className="shrink-0 rounded-full bg-brand-nav px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">vi</span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-gray-500 dark:text-zinc-400">
                          {r.username ? `@${r.username}` : ""}
                          {r.username && location(r) ? " · " : ""}
                          {location(r)}
                          {!r.username && !location(r) ? `${r.quizzesPlayed} kviza` : ""}
                        </span>
                        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800" aria-hidden>
                          <span
                            className={`block h-full rounded-full transition-all ${isMe ? "bg-gradient-to-r from-brand-nav to-brand-quiz" : "bg-gradient-to-r from-violet-300 to-fuchsia-300"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-base font-extrabold tabular-nums text-gray-900 dark:text-zinc-100">{r.totalScore}</span>
                        <span className="block whitespace-nowrap text-[11px] tabular-nums text-gray-500 dark:text-zinc-400">
                          {r.quizzesPlayed} kviza · {gap != null && gap > 0 ? `+${gap} do #${r.rank - 1}` : "vrh"}
                        </span>
                      </span>
                      <span aria-hidden className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-quiz">›</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            {visible < filtered.length && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => setVisible((v) => v + 20)}
                className="mt-4 border-brand-muted/50 text-brand-quiz shadow-card hover:bg-fuchsia-50 dark:text-fuchsia-300"
              >
                Prikaži još ({filtered.length - visible} preostalo)
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-zinc-500">
              Boduju se samo prvi pokušaji · poredak po bodovima, brže vrijeme odlučuje kod izjednačenja
            </p>
          </section>
        </>
      )}
    </div>
  );
}
