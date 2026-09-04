import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMe } from "../auth/hooks";
import { useUpdateMe, type ProfileUser } from "./api";
import { AvatarUpload } from "./AvatarUpload";
import { ChangePassword } from "./ChangePassword";
import { Spinner } from "../../components/ui/Spinner";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { INPUT_CLASS } from "../../components/ui/Input";
import { SELECT_CLASS } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { avatarSrc } from "../../lib/avatar";
import { api } from "../../lib/api";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(250, "Biografija može imati najviše 250 znakova.").optional(),
  nickname: z.string().optional(),
  username: z.string().optional(),
  notifyNewQuiz: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

type Tab = "info" | "avatar" | "security";

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: "info",
    label: "Lični podaci",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "avatar",
    label: "Slika",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Sigurnost",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

interface PublicStats {
  totalScore: number;
  quizzesPlayed: number;
  rank: number | null;
}

/* ── "Lični podaci" tab styling — canonical tokens live in components/ui ── */

// Right-icon clearance for FieldShell inputs (icon overlays the field).
const FIELD_INPUT = `${INPUT_CLASS} pr-9`;

const COUNTRIES = ["Bosna i Hercegovina", "Crna Gora", "Hrvatska", "Srbija"];

function FieldSvg({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function FieldShell({
  id,
  label,
  required,
  icon,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Field id={id} label={label} required={required}>
      <div className="group relative">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors group-focus-within:text-brand-quiz dark:group-focus-within:text-fuchsia-300"
        >
          {icon}
        </div>
      </div>
    </Field>
  );
}

export function ProfilePage() {
  const { data: user, isLoading, isError, error } = useMe();
  const mutation = useUpdateMe();
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [notifyNewQuiz, setNotifyNewQuiz] = useState(true);
  const bioValue = watch("bio") ?? "";
  const countryValue = watch("country") ?? "";
  // Preserve a legacy free-text value (e.g. "BiH") so it isn't lost on save.
  const countryOptions =
    countryValue && !COUNTRIES.includes(countryValue) ? [countryValue, ...COUNTRIES] : COUNTRIES;

  const profile = user as ProfileUser | undefined;
  const { data: stats } = useQuery({
    queryKey: ["user", profile?.id],
    queryFn: () => api(`/api/users/${profile!.id}`) as Promise<PublicStats>,
    enabled: profile?.id != null,
  });

  useEffect(() => {
    if (user) {
      const u = user as ProfileUser;
      reset({
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        country: u.country ?? "",
        city: u.city ?? "",
        bio: u.bio ?? "",
        nickname: u.nickname ?? "",
        username: u.username ?? "",
      });
      setNotifyNewQuiz(u.notifyNewQuiz ?? true);
    }
  }, [user, reset]);

  async function onSubmit(values: FormValues) {
    setMessage(null);
    try {
      await mutation.mutateAsync({ ...values, notifyNewQuiz });
      setMessage("Profil sačuvan.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  // Auto-dismiss the success toast (mockup behaviour).
  useEffect(() => {
    if (message !== "Profil sačuvan.") return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  if (isLoading) {
    return (
      <main className="page-container">
        <Spinner label="Učitavanje..." />
      </main>
    );
  }
  if (isError) {
    return (
      <main className="page-container">
        <Alert tone="error">
          Greška: {(error as Error)?.message ?? "Neuspješno učitavanje profila."}
        </Alert>
      </main>
    );
  }

  const isSuccess = message === "Profil sačuvan.";
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.username ||
    profile?.email ||
    "Korisnik";
  const heroAvatar = avatarSrc(profile?.avatarFile, displayName);
  const heroInitial = (displayName.trim().charAt(0) || "?").toUpperCase();
  const loc = [profile?.city, profile?.country].filter(Boolean).join(", ");

  const completeFields = [
    profile?.firstName,
    profile?.lastName,
    profile?.username,
    profile?.nickname,
    profile?.country,
    profile?.city,
    profile?.bio,
    profile?.avatarFile,
  ].filter((v) => v && String(v).trim()).length;
  const completeness = Math.round((completeFields / 8) * 100);

  return (
    <main className="page-container">
      {isSuccess && (
        <div
          role="status"
          className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border border-emerald-700/50 bg-emerald-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
        >
          <span className="rounded-full bg-emerald-500 p-1">
            <FieldSvg className="h-4 w-4">
              <path d="M20 6 9 17l-5-5" />
            </FieldSvg>
          </span>
          <span>
            <span className="block text-sm font-semibold">Promjene su uspješno sačuvane!</span>
            <span className="block text-xs text-emerald-200">Vaš profil je ažuriran.</span>
          </span>
        </div>
      )}
      {/* ── Identity header ─────────────────────────────── */}
      <header className="overflow-hidden rounded-2xl border border-brand-muted/40 bg-white dark:bg-zinc-900 shadow-card">
        <div className="h-1.5 bg-gradient-to-r from-brand-nav via-fuchsia-400 to-amber-300" aria-hidden />
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {heroAvatar ? (
              <img
                src={heroAvatar}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-brand-muted/50"
              />
            ) : (
              <span
                role="img"
                aria-label="Avatar"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz text-3xl font-bold text-white"
              >
                {heroInitial}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-quiz dark:text-fuchsia-300">Moj profil</p>
              <h1 className="mt-0.5 truncate text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-zinc-400">
                {profile?.username && <span className="font-medium text-gray-600 dark:text-zinc-400">@{profile.username}</span>}
                {profile?.nickname && <span className="rounded-full bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">“{profile.nickname}”</span>}
                {loc && (
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {loc}
                  </span>
                )}
              </div>
              {profile?.bio && <p className="mt-1.5 max-w-lg break-words text-sm text-gray-600 dark:text-zinc-400">{profile.bio}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                <span className="truncate">{profile?.email}</span>
                {profile?.role && <Badge tone={profile.role === "admin" ? "brand" : "neutral"}>{profile.role}</Badge>}
              </div>
            </div>
          </div>
          <Link
            to="/leaderboard"
            className="group flex shrink-0 items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz p-4 pr-5 text-white shadow-md transition-transform hover:-translate-y-0.5 lg:min-w-[240px]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-extrabold tabular-nums backdrop-blur">
              {stats?.rank != null ? stats.rank : "—"}
            </span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Rang na listi</span>
              <span className="block text-sm font-bold">
                {stats ? `${stats.totalScore} bodova · ${stats.quizzesPlayed} kviza` : "Učitavanje..."}
              </span>
              <span className="mt-0.5 block text-xs text-white/80">otvori rang listu →</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60 px-5 py-3 sm:flex-row sm:items-center sm:p-4 sm:px-6">
          <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Popunjenost profila</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Popunjenost profila">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-nav to-fuchsia-400 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-brand-quiz dark:text-fuchsia-300">{completeness}%</span>
        </div>
      </header>

      {/* ── Settings tabs ───────────────────────────────── */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-brand-muted/40 bg-white dark:bg-zinc-900 shadow-card">
        <div role="tablist" aria-label="Postavke profila" className="flex gap-1 overflow-x-auto border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60 p-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-white dark:bg-zinc-900 text-brand-quiz dark:text-fuchsia-300 shadow-card ring-1 ring-brand-muted/40" : "text-gray-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-gray-800"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {tab === "info" && (
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col" role="tabpanel">
              {/* ── Panel header ── */}
              <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-muted/20 text-brand-quiz dark:text-fuchsia-300">
                      <FieldSvg className="h-5 w-5">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z" />
                        <path d="m15 5 4 4" />
                      </FieldSvg>
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Lični podaci</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                    Uredite svoje osnovne informacije i postavke naloga
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-2 dark:border-zinc-800 dark:bg-zinc-800/60 sm:self-auto">
                  <span className="relative">
                    {heroAvatar ? (
                      <img src={heroAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-brand-nav to-fuchsia-400 text-sm font-bold text-white">
                        {heroInitial}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-[160px] truncate text-xs font-semibold leading-tight text-gray-800 dark:text-zinc-100">
                      {displayName}
                    </span>
                    <span className="block text-[11px] text-gray-400">
                      {profile?.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* ── Row 1: Ime & Prezime ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <FieldShell
                    id="profile-firstName"
                    label="Ime"
                    required
                    icon={
                      <FieldSvg>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </FieldSvg>
                    }
                  >
                    <input
                      id="profile-firstName"
                      type="text"
                      required
                      placeholder="Unesite vaše ime"
                      autoComplete="given-name"
                      {...register("firstName")}
                      className={FIELD_INPUT}
                    />
                  </FieldShell>
                  <FieldShell
                    id="profile-lastName"
                    label="Prezime"
                    required
                    icon={
                      <FieldSvg>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </FieldSvg>
                    }
                  >
                    <input
                      id="profile-lastName"
                      type="text"
                      required
                      placeholder="Unesite vaše prezime"
                      autoComplete="family-name"
                      {...register("lastName")}
                      className={FIELD_INPUT}
                    />
                  </FieldShell>
                </div>

                {/* ── Row 2: Država & Grad ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <FieldShell
                    id="profile-country"
                    label="Država"
                    icon={
                      <FieldSvg>
                        <path d="m6 9 6 6 6-6" />
                      </FieldSvg>
                    }
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"
                    >
                      <FieldSvg>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                      </FieldSvg>
                    </span>
                    <select
                      id="profile-country"
                      {...register("country")}
                      className={`${SELECT_CLASS} bg-none pl-10 pr-9`}
                    >
                      <option value="">Izaberite državu</option>
                      {countryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                  <FieldShell
                    id="profile-city"
                    label="Grad"
                    icon={
                      <FieldSvg>
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </FieldSvg>
                    }
                  >
                    <input
                      id="profile-city"
                      type="text"
                      placeholder="npr. Sarajevo"
                      autoComplete="address-level2"
                      {...register("city")}
                      className={FIELD_INPUT}
                    />
                  </FieldShell>
                </div>

                {/* ── Row 3: Biografija ── */}
                <Textarea
                  id="profile-bio"
                  label="Biografija"
                  rows={3}
                  maxLength={250}
                  placeholder="Napišite kratak opis o sebi, interesovanjima ili ciljevima..."
                  counter={{ value: bioValue.length, max: 250 }}
                  {...register("bio")}
                />

                {/* ── Row 4: Nadimak & Korisničko ime ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <FieldShell
                    id="profile-nickname"
                    label="Nadimak"
                    icon={
                      <FieldSvg>
                        <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
                      </FieldSvg>
                    }
                  >
                    <input
                      id="profile-nickname"
                      type="text"
                      placeholder="npr. BrziKvizaš"
                      autoComplete="off"
                      {...register("nickname")}
                      className={FIELD_INPUT}
                    />
                  </FieldShell>
                  <FieldShell
                    id="profile-username"
                    label="Korisničko ime"
                    icon={
                      <FieldSvg>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                      </FieldSvg>
                    }
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-gray-400"
                    >
                      @
                    </span>
                    <input
                      id="profile-username"
                      type="text"
                      placeholder="korisnicko_ime"
                      autoComplete="username"
                      {...register("username")}
                      className={`${FIELD_INPUT} pl-8`}
                    />
                  </FieldShell>
                </div>

                {/* ── Row 5: Obavijesti ── */}
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-fuchsia-50/40 p-4 transition-all hover:border-brand-muted hover:to-fuchsia-50/70 focus-within:ring-2 focus-within:ring-brand-nav/40 dark:border-zinc-700 dark:from-zinc-800/60 dark:to-zinc-800 dark:hover:border-brand-quiz">
                  <span className="flex min-w-0 items-start gap-3.5 pr-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white text-brand-quiz shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-fuchsia-300">
                      <FieldSvg className="h-5 w-5">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </FieldSvg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        Obavijesti o novim kvizovima
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-zinc-400">
                        Primite email obavijest čim se objavi novi kviz ili takmičenje
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center">
                    <input
                      type="checkbox"
                      checked={notifyNewQuiz}
                      onChange={(e) => setNotifyNewQuiz(e.target.checked)}
                      className="sr-only"
                      aria-label="Obavijesti o novim kvizovima"
                    />
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        notifyNewQuiz
                          ? "border-brand-nav bg-brand-nav"
                          : "border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-3.5 w-3.5 text-white transition-opacity ${notifyNewQuiz ? "opacity-100" : "opacity-0"}`}
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  </span>
                </label>

                {/* ── Row 6: Submit ── */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={mutation.isPending}
                  >
                    {mutation.isPending ? "Čuvanje u toku..." : "Sačuvaj promjene"}
                  </Button>
                  {message && !isSuccess && (
                    <Alert tone="error" className="mt-3">
                      {message}
                    </Alert>
                  )}
                </div>
              </div>
            </form>
          )}
          {tab === "avatar" && (
            <div role="tabpanel" className="max-w-2xl">
              <AvatarUpload />
            </div>
          )}
          {tab === "security" && (
            <div role="tabpanel" className="max-w-2xl">
              <ChangePassword />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
