import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

/* ── icons (inline SVG, no extra deps) ─────────────────────── */

function Icon({ children, className = "h-6 w-6" }: { children: React.ReactNode; className?: string }) {
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

const STEPS = [
  {
    n: "1",
    title: "Izaberi modul",
    text: "Moduli se otključavaju postepeno — uvijek znaš šta je sljedeće na redu.",
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </>
    ),
  },
  {
    n: "2",
    title: "Riješi kviz",
    text: "Odgovori na pitanja prije isteka vremena. Boduje se samo prvi pokušaj.",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  {
    n: "3",
    title: "Popni se na tabeli",
    text: "Svaki bod te gura gore na rang listi. Prestigni igrača iznad sebe.",
    icon: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 2 4.5 4.5 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-2 4.5-4.5 4.5" />
      </>
    ),
  },
];

const FEATURES = [
  {
    title: "Pošteni bodovi",
    text: "Računa se samo prvi pokušaj — nema farmovanja, pobjeđuje znanje.",
    icon: (
      <>
        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Rang lista uživo",
    text: "Tabela, postolje i tvoja pozicija — vidiš tačno koliko ti fali do vrha.",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-6 4 3 4-8" />
      </>
    ),
  },
  {
    title: "Ponavljanje grešaka",
    text: "Pogrešni odgovori se vraćaju kao špil za ponavljanje dok ne legnu.",
    icon: (
      <>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </>
    ),
  },
];

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;

  return (
    <div className="flex flex-col gap-10 py-6 sm:py-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-nav via-[#9c3fc7] to-brand-quiz text-white shadow-card">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-white/10" />
          <div className="absolute right-1/3 top-8 hidden h-16 w-16 rotate-12 rounded-2xl bg-white/10 lg:block" />
          <div className="absolute bottom-10 left-1/3 hidden h-10 w-10 -rotate-12 rounded-xl bg-amber-300/30 lg:block" />
        </div>

        <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/25">
              <span aria-hidden>✦</span> Kviz platforma
            </p>
            <p className="mt-4 text-xl font-black tracking-wide text-white/90">+ULTRA</p>
            <h1 className="mt-1 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Dokaži znanje.
              <br />
              Osvoji tron.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/85">
              Rješavaj kvizove po modulima, skupljaj bodove iz prvog pokušaja i probijaj se na rang
              listi. Brže vrijeme odlučuje kod izjednačenja.
            </p>
            <nav aria-label="Prijava i registracija" className="mt-6 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white dark:bg-zinc-900 px-6 py-3 text-[15px] font-bold text-brand-quiz dark:text-fuchsia-300 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Kreni besplatno →
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 py-3 text-[15px] font-bold text-white ring-2 ring-white/50 transition-colors hover:bg-white/10"
              >
                Imam nalog — prijava
              </Link>
            </nav>
            <p className="mt-3 text-xs text-white/70">Registracija za minut · samo email i lozinka</p>
          </div>

          {/* decorative mock visual */}
          <div aria-hidden className="relative hidden select-none sm:block">
            <div className="mx-auto w-full max-w-sm rotate-2 rounded-2xl bg-white dark:bg-zinc-900 p-5 text-gray-900 dark:text-zinc-100 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Pitanje 3 / 10</p>
                <p className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-fuchsia-700">
                  00:42
                </p>
              </div>
              <p className="mt-2 text-[15px] font-bold leading-snug">
                Koji hook čuva stanje između rendera?
              </p>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-brand-nav to-brand-quiz" />
              </div>
              <ul className="mt-3 flex flex-col gap-2 text-sm font-medium">
                <li className="rounded-xl border border-gray-200 dark:border-zinc-800 px-3 py-2 text-gray-500 dark:text-zinc-400">useEffect</li>
                <li className="rounded-xl border-2 border-green-400 bg-green-50 dark:bg-green-950 px-3 py-2 font-bold text-green-800">
                  useState ✓
                </li>
                <li className="rounded-xl border border-gray-200 dark:border-zinc-800 px-3 py-2 text-gray-500 dark:text-zinc-400">useRef</li>
              </ul>
            </div>
            <div className="absolute -bottom-6 -left-2 flex -rotate-3 items-center gap-3 rounded-2xl bg-gray-900 p-3 pr-5 text-white shadow-2xl lg:left-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 text-lg font-black text-amber-950">
                2
              </span>
              <span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Tvoj rang
                </span>
                <span className="block text-sm font-bold">1.280 bodova · još 40 do 👑</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section aria-label="Kako funkcioniše">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-quiz dark:text-fuchsia-300">Kako funkcioniše</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
          Od prvog klika do vrha tabele
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-card"
            >
              <span aria-hidden className="absolute -right-2 -top-5 select-none text-[88px] font-black leading-none text-fuchsia-100">
                {s.n}
              </span>
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-nav to-brand-quiz text-white shadow-md">
                <Icon>{s.icon}</Icon>
              </span>
              <h3 className="relative mt-3 font-bold text-gray-900 dark:text-zinc-100">{s.title}</h3>
              <p className="relative mt-1 text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section aria-label="Zašto +ULTRA" className="rounded-3xl bg-gray-900 p-6 text-white sm:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia-300">Zašto +ULTRA</p>
        <h2 className="mt-1 max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">
          Napravljeno za fer takmičenje i pravo učenje
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <Icon>{f.icon}</Icon>
              </span>
              <h3 className="mt-3 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-white to-amber-50 p-6 text-center shadow-card sm:p-10">
        <p aria-hidden className="text-4xl">🚀</p>
        <h2 className="mx-auto mt-2 max-w-md text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
          Spremni da zauzmete svoje mjesto?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-zinc-400">
          Napravi nalog, odigraj prvi kviz i pojavi se na rang listi — bodovi iz prvog pokušaja se
          računaju odmah.
        </p>
        <div className="mx-auto mt-5 flex max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-brand-nav px-6 py-3 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-brand-quiz sm:flex-none"
          >
            Registracija
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-[15px] font-bold text-gray-800 dark:text-zinc-200 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 sm:flex-none"
          >
            Prijava
          </Link>
        </div>
      </section>
    </div>
  );
}
