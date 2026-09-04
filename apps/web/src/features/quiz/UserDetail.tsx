import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { avatarSrc } from "../../lib/avatar";
import { useLeaderboard } from "./api";
import { useAuthStore } from "../../stores/auth";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClasses } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/EmptyState";

interface UserDetailData {
  userId: number;
  firstName: string;
  lastName: string;
  username: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  avatarFile: string | null;
  avatarUrl: string | null;
  totalScore: number;
  quizzesPlayed: number;
  rank: number | null;
}

/* ── helpers ─────────────────────────────────────────────── */

const AVATAR_BG = [
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
];

const COVERS = [
  "from-brand-nav via-brand-quiz to-brand-auth",
  "from-violet-600 via-fuchsia-500 to-amber-300",
  "from-sky-600 via-indigo-500 to-violet-500",
  "from-emerald-600 via-teal-500 to-sky-400",
  "from-rose-500 via-orange-400 to-amber-300",
];

function bgFor(id: number) {
  return AVATAR_BG[Math.abs(id) % AVATAR_BG.length];
}

function coverFor(id: number) {
  return COVERS[Math.abs(id) % COVERS.length];
}

function initials(firstName: string, lastName: string) {
  const s = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  return s || "?";
}

function fullName(u: Pick<UserDetailData, "firstName" | "lastName">) {
  return `${u.firstName} ${u.lastName}`.trim() || "Nepoznat igrač";
}

function locationOf(u: Pick<UserDetailData, "country" | "city">) {
  return [u.city, u.country].filter(Boolean).join(", ");
}

function tierFor(rank: number | null, quizzesPlayed: number) {
  if (!quizzesPlayed || rank == null)
    return { label: "Novajlija", classes: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300", icon: "🌱" };
  if (rank === 1) return { label: "Šampion", classes: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300", icon: "👑" };
  if (rank <= 3) return { label: "Elita", classes: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300", icon: "🏅" };
  if (rank <= 10) return { label: "Pro igrač", classes: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300", icon: "⚡" };
  return { label: "Takmičar", classes: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", icon: "🎯" };
}

function rankMedal(rank: number | null) {
  if (rank === 1) return "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950";
  if (rank === 2) return "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800";
  if (rank === 3) return "bg-gradient-to-br from-orange-300 to-amber-600 text-orange-950";
  return "bg-brand-nav text-white";
}

/* ── small pieces ────────────────────────────────────────── */

function StatCard({
  icon,
  value,
  label,
  hint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <span
        aria-hidden
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted/20 text-brand-quiz dark:text-fuchsia-300"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          {icon}
        </svg>
      </span>
      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-zinc-100">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-zinc-500">{hint}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl" aria-label="Učitavanje profila">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-28 animate-pulse bg-gradient-to-r from-brand-muted/40 via-fuchsia-100 to-amber-100 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800 sm:h-36" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200 ring-4 ring-white dark:bg-zinc-700 dark:ring-zinc-900" />
          <div className="mt-4 h-7 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-zinc-700" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
          <div className="mt-3 h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white shadow-card ring-1 ring-gray-100 dark:bg-zinc-900 dark:ring-zinc-800" />
        ))}
      </div>
      <p role="status" className="mt-4 text-center text-sm text-gray-400">
        Učitavanje profila…
      </p>
    </div>
  );
}

function StateCard({
  emoji,
  title,
  message,
  action,
}: {
  emoji: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-5xl" aria-hidden>
        {emoji}
      </p>
      <h1 className="mt-3 text-lg font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
      <p className="mt-1 break-words text-sm text-gray-500 dark:text-zinc-400">{message}</p>
      {action ? <div className="mt-5 flex flex-col gap-2">{action}</div> : null}
    </div>
  );
}

/* ── main ────────────────────────────────────────────────── */

export function UserDetail() {
  const { userId } = useParams();
  const id = Number(userId);
  const idValid = userId !== undefined && userId !== "" && !Number.isNaN(id);
  const meId = useAuthStore((s) => s.user?.id);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api(`/api/users/${id}`) as Promise<UserDetailData>,
    enabled: idValid,
    retry: 1,
  });

  const { data: board } = useLeaderboard();
  const rows: { userId: number; rank: number; firstName: string; lastName: string; totalScore: number }[] =
    Array.isArray(board) ? board : [];

  if (!idValid) {
    return (
      <div className="page-container">
        <StateCard
          emoji="🔗"
          title="Neispravan link"
          message="Ovaj link ka profilu nije validan. Vrati se na rang listu i pokušaj ponovo."
          action={
            <Link
              to="/leaderboard"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-nav px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-quiz"
            >
              Nazad na rang listu
            </Link>
          }
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="page-container">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message ?? "";
    const notFound = /nije pronadjen|not found|404/i.test(msg);
    return (
      <div className="page-container">
        <StateCard
          emoji={notFound ? "🕵️" : "😕"}
          title={notFound ? "Igrač ne postoji" : "Nismo mogli učitati profil"}
          message={msg || "Došlo je do greške. Pokušaj ponovo."}
          action={
            <>
              <Button onClick={() => refetch()} loading={isFetching}>
                {isFetching ? "Učitavanje…" : "Pokušaj ponovo"}
              </Button>
              <Link to="/leaderboard" className={buttonClasses("outline", "md")}>
                Nazad na rang listu
              </Link>
            </>
          }
        />
      </div>
    );
  }

  const u = data;
  const name = fullName(u);
  const location = locationOf(u);
  const avatar = avatarSrc(u.avatarFile, name) ?? u.avatarUrl;
  const tier = tierFor(u.rank, u.quizzesPlayed);
  const avg = u.quizzesPlayed ? (u.totalScore / u.quizzesPlayed).toFixed(1) : "—";
  const isMe = meId != null && meId === u.userId;

  const leader = rows[0] as { userId: number; rank: number; firstName: string; lastName: string; totalScore: number } | undefined;
  const above =
    u.rank != null && u.rank > 1
      ? (rows.find((r) => r.rank === u.rank! - 1) as { firstName: string; lastName: string; totalScore: number } | undefined)
      : undefined;
  const leaderGap = leader && leader.userId !== u.userId ? leader.totalScore - u.totalScore : null;
  const aboveGap = above ? above.totalScore - u.totalScore : null;
  const progressPct =
    leader && leader.totalScore > 0 ? Math.max(4, Math.min(100, Math.round((u.totalScore / leader.totalScore) * 100))) : 0;

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="page-container">
      <div className="mx-auto w-full max-w-4xl">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Navigacija" className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
          <Link to="/leaderboard" className="font-medium text-brand-quiz hover:underline dark:text-fuchsia-300">
            Rang lista
          </Link>
          <span aria-hidden className="text-gray-300 dark:text-zinc-600">
            /
          </span>
          <span className="max-w-[220px] truncate font-semibold text-gray-700 dark:text-zinc-200 sm:max-w-none">{name}</span>
        </nav>

        {/* ── Hero ── */}
        <section
          aria-label={`Profil igrača ${name}`}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* cover */}
          <div className={`relative h-28 bg-gradient-to-r sm:h-36 ${coverFor(u.userId)}`} aria-hidden>
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-white/15" />
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute bottom-0 right-6 hidden select-none text-[92px] font-black leading-none text-white/20 sm:block">
              {u.rank != null ? `#${u.rank}` : "★"}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-white/40 via-white/10 to-transparent" />
          </div>

          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
              {/* avatar */}
              <div className="relative shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`Avatar igrača ${name}`}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md dark:border-zinc-900 sm:h-28 sm:w-28"
                  />
                ) : (
                  <span
                    role="img"
                    aria-label={`Avatar igrača ${name}`}
                    className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-3xl font-extrabold shadow-md dark:border-zinc-900 sm:h-28 sm:w-28 ${bgFor(u.userId)}`}
                  >
                    {initials(u.firstName, u.lastName)}
                  </span>
                )}
                {u.rank != null && (
                  <span
                    title={`Rang #${u.rank}`}
                    className={`absolute -bottom-1 -right-1 flex h-9 min-w-9 items-center justify-center rounded-full px-1.5 text-sm font-extrabold tabular-nums shadow-md ring-2 ring-white dark:ring-zinc-900 ${rankMedal(u.rank)}`}
                  >
                    #{u.rank}
                  </span>
                )}
              </div>

              {/* identity */}
              <div className="min-w-0 flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tier.classes}`}
                  >
                    <span aria-hidden>{tier.icon}</span> {tier.label}
                  </span>
                  {isMe && (
                    <span className="inline-flex items-center rounded-full bg-brand-nav px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                      To si ti
                    </span>
                  )}
                  {u.rank != null && u.rank <= 3 && (
                    <span className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-amber-300 dark:bg-amber-300 dark:text-amber-950">
                      Top 3
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 break-words text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
                  {name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-zinc-400">
                  {u.username ? <span className="break-all font-medium text-gray-600 dark:text-zinc-300">@{u.username}</span> : null}
                  {location ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-gray-400" aria-hidden>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="truncate">{location}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              {/* actions */}
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch lg:flex-row">
                <Button variant="outline" onClick={share} aria-live="polite">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  {copied ? "Link kopiran ✓" : "Podijeli"}
                </Button>
                {isMe ? (
                  <Link to="/profile" className={buttonClasses("primary", "md")}>
                    Uredi profil
                  </Link>
                ) : (
                  <Link to="/home" className={buttonClasses("primary", "md")}>
                    Igraj i prestigni →
                  </Link>
                )}
              </div>
            </div>

            {/* bio */}
            {u.bio ? (
              <blockquote className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700 ring-1 ring-gray-100 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                <span aria-hidden className="mr-1 text-lg leading-none text-brand-muted">
                  “
                </span>
                <span className="break-words">{u.bio}</span>
              </blockquote>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 text-sm italic text-gray-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500">
                {isMe ? "Dodaj biografiju na stranici profila da te drugi bolje upoznaju." : "Igrač još nije dodao biografiju."}
              </p>
            )}
          </div>
        </section>

        {/* ── Stats ── */}
        <section aria-label="Statistika igrača" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            value={String(u.totalScore)}
            label="Bodovi"
            hint={`${avg} prosječno po kvizu`}
            icon={<path d="M12 2l2.9 6.26 6.6.57-5 4.4 1.5 6.47L12 16.9 5.99 19.7l1.5-6.47-5-4.4 6.6-.57L12 2Z" />}
          />
          <StatCard
            value={String(u.quizzesPlayed)}
            label="Kvizovi"
            hint="boduju se prvi pokušaji"
            icon={<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1M17 8l2 2 4-4" />}
          />
          <StatCard
            value={u.rank != null ? `#${u.rank}` : "—"}
            label="Rang"
            hint={u.rank != null ? tier.label.toLowerCase() : "van rang liste"}
            icon={<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />}
          />
          <StatCard
            value={String(avg)}
            label="Prosjek"
            hint="bodova po kvizu"
            icon={<path d="M3 3v18h18M7 15l4-6 4 3 4-8" />}
          />
        </section>

        {/* ── Race + details ── */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          {/* race */}
          <section aria-label="Trka za vrhom" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">Trka za vrhom</h2>
              <Link to="/leaderboard" className="text-xs font-semibold text-brand-quiz hover:underline dark:text-fuchsia-300">
                Puna tabela →
              </Link>
            </div>

            {u.quizzesPlayed === 0 || (u.rank == null && u.totalScore === 0) ? (
              <div className="mt-3 rounded-xl bg-gradient-to-br from-fuchsia-50 to-violet-50 p-5 text-center ring-1 ring-fuchsia-100 dark:from-fuchsia-950/50 dark:to-violet-950/50 dark:ring-fuchsia-900">
                <p className="text-3xl" aria-hidden>
                  🚀
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-zinc-100">
                  {isMe ? "Još nemaš bodova" : `${name.split(" ")[0]} još nema bodova`}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  Boduju se samo prvi pokušaji — odigraj kviz i pojavi se na tabeli.
                </p>
                <Link
                  to="/home"
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-nav px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-quiz"
                >
                  Igraj kviz
                </Link>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-end justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                    <span className="tabular-nums text-brand-quiz dark:text-fuchsia-300">{u.totalScore}</span>{" "}
                    <span className="font-medium text-gray-500 dark:text-zinc-400">bodova</span>
                  </p>
                  {leader && leaderGap != null && leaderGap > 0 ? (
                    <p className="text-right text-xs tabular-nums text-gray-500 dark:text-zinc-400">
                      lider: {leader.firstName} {leader.lastName} · {leader.totalScore}
                    </p>
                  ) : (
                    <p className="text-right text-xs font-bold text-amber-600 dark:text-amber-400">👑 drži vrh tabele</p>
                  )}
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800"
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Postotak bodova lidera: ${progressPct}%`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-nav to-brand-quiz transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <ul className="mt-4 flex flex-col gap-2 text-sm">
                  {aboveGap != null && aboveGap > 0 && above ? (
                    <li className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 dark:bg-zinc-800 dark:ring-zinc-700">
                      <span className="min-w-0 truncate text-gray-600 dark:text-zinc-300">
                        Još <strong className="tabular-nums text-gray-900 dark:text-zinc-100">{aboveGap}</strong>{" "}
                        {aboveGap === 1 ? "bod" : aboveGap % 10 === 1 ? "bod" : "bodova"} do{" "}
                        <strong>
                          #{u.rank! - 1} ({above.firstName} {above.lastName})
                        </strong>
                      </span>
                      <Link
                        to="/leaderboard"
                        className="shrink-0 text-xs font-bold text-brand-quiz hover:underline dark:text-fuchsia-300"
                      >
                        Prestigni →
                      </Link>
                    </li>
                  ) : u.rank === 1 ? (
                    <li className="rounded-xl bg-amber-50 px-3 py-2.5 text-gray-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900">
                      Svaka čast — <strong>prvi si na tabeli.</strong> Odigraj još i učvrsti prednost.
                    </li>
                  ) : null}
                  {leaderGap != null && leaderGap > 0 && leader ? (
                    <li className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 ring-1 ring-gray-100 dark:bg-zinc-800 dark:ring-zinc-700">
                      <span className="min-w-0 truncate text-gray-600 dark:text-zinc-300">
                        <strong className="tabular-nums text-gray-900 dark:text-zinc-100">{leaderGap}</strong> bodova do trona 👑
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-gray-400 dark:text-zinc-500">{progressPct}% lidera</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-400 dark:text-zinc-500">
              Boduju se samo prvi pokušaji · kod istog broja bodova odlučuje brže vrijeme.
            </p>
          </section>

          {/* details */}
          <aside aria-label="Detalji o igraču" className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">Detalji</h2>
            <dl className="mt-3 flex flex-col divide-y divide-gray-100 text-sm dark:divide-zinc-800">
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-gray-500 dark:text-zinc-400">Korisničko ime</dt>
                <dd className="max-w-[60%] truncate font-semibold text-gray-900 dark:text-zinc-100">
                  {u.username ? `@${u.username}` : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-gray-500 dark:text-zinc-400">Lokacija</dt>
                <dd className="max-w-[60%] truncate text-right font-semibold text-gray-900 dark:text-zinc-100">{location || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-gray-500 dark:text-zinc-400">Status</dt>
                <dd>
                  {u.quizzesPlayed > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-status-success ring-1 ring-green-200 dark:bg-green-950 dark:ring-green-900">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
                      Aktivan takmičar
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Čeka prvi kviz
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <dt className="text-gray-500 dark:text-zinc-400">Prosjek / kviz</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{avg}</dd>
              </div>
            </dl>
            <Link
              to="/leaderboard"
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              ← Nazad na rang listu
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
