import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const PERKS = [
  {
    title: "Rang lista uživo",
    text: "Svaki bod iz prvog pokušaja te gura prema vrhu.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 2 4.5 4.5 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-2 4.5-4.5 4.5" />
      </svg>
    ),
  },
  {
    title: "Brzi kvizovi",
    text: "Kratke provjere znanja koje staneš bilo kad.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
      </svg>
    ),
  },
  {
    title: "Ponavljanje gradiva",
    text: "Kartice s pitanjima koja si promašio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
];

/** Split-screen shell for all auth pages: brand story left, form right. */
export function AuthLayout({ icon, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-3xl border border-brand-muted/40 bg-white dark:bg-zinc-900 shadow-card lg:grid-cols-[1.05fr_1fr]">
        {/* ── Brand panel ── */}
        <div className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-brand-nav via-brand-quiz to-[#4c2358] p-8 text-white lg:flex">
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 600">
            <circle cx="340" cy="80" r="130" fill="#fff" opacity="0.07" />
            <circle cx="40" cy="540" r="150" fill="#fff" opacity="0.06" />
            <circle cx="70" cy="140" r="4" fill="#fbbf24" opacity="0.8" />
            <circle cx="330" cy="420" r="5" fill="#fbbf24" opacity="0.6" />
            <circle cx="120" cy="470" r="3" fill="#fff" opacity="0.5" />
            <path d="M300 200l3 7.5 7.5 3-7.5 3-3 7.5-3-7.5-7.5-3 7.5-3Z" fill="#fbbf24" opacity="0.8" />
            <text x="310" y="560" fontSize="150" fontWeight="900" fill="#fff" opacity="0.08" fontFamily="system-ui, sans-serif">?</text>
          </svg>
          <Link to="/" className="relative text-2xl font-extrabold tracking-wide">
            +ULTRA
          </Link>
          <div className="relative mt-10">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              ZnanJe koje se
              <br />
              isplati.
            </h2>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Rješavaj kvizove, skupljaj bodove iz prvog pokušaja i penji se na rang listi.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {PERKS.map((p) => (
                <li key={p.title} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    {p.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{p.title}</span>
                    <span className="block text-xs text-white/70">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-white/50">PLUS ULTRA Quiz · uči kroz igru</p>
        </div>

        {/* ── Form panel ── */}
        <div className="p-6 sm:p-8">
          <Link to="/" className="mb-6 inline-block text-xl font-extrabold tracking-wide text-brand-quiz dark:text-fuchsia-300 lg:hidden">
            +ULTRA
          </Link>
          <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-nav to-brand-quiz text-white shadow-md">
            {icon}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-xl bg-red-50 dark:bg-red-950 px-3 py-2.5 text-sm text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-900">
      {message}
    </p>
  );
}
