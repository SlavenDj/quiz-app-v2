import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useLogout } from "../features/auth/hooks";
import { useThemeStore, type ThemeMode } from "../stores/theme";
import { isDemo } from "../lib/demo";

/* ── icons (inline SVG, no extra deps) ─────────────────────── */

function Icon({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
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

const BoltIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" strokeLinejoin="round" />
  </Icon>
);

const HomeIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Icon>
);

const TrophyIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 2 4.5 4.5 4.5M17 6h3a1 1 0 0 1 1 1c0 2.5-2 4.5-4.5 4.5" />
  </Icon>
);

const LayersIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="m12 2 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </Icon>
);

const UserIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const ShieldIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const LoginIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
  </Icon>
);

const RegisterIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </Icon>
);

const LogoutIcon = (cls = "h-5 w-5") => (
  <Icon className={cls}>
    <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);

const MenuIcon = (cls = "h-6 w-6") => (
  <Icon className={cls}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

const CloseIcon = (cls = "h-6 w-6") => (
  <Icon className={cls}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

/* ── theme switcher (kept, restyled as icon control) ───────── */

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: ReactNode }[] = [
  {
    id: "auto",
    label: "Auto (prati sistem)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: "light",
    label: "Svijetla tema",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Tamna tema",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    ),
  },
];

export function ThemeSwitcher() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  return (
    <div
      role="group"
      aria-label="Tema"
      className="flex items-center rounded-full bg-white/15 p-1 ring-1 ring-white/20"
    >
      {THEME_OPTIONS.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            onClick={() => setMode(o.id)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              active ? "bg-white text-brand-quiz shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

/* ── nav config ────────────────────────────────────────────── */

interface Tab {
  to: string;
  label: string;
  icon: (cls?: string) => ReactNode;
  end?: boolean;
}

const AUTH_TABS: Tab[] = [
  { to: "/home", label: "Početna", icon: HomeIcon, end: true },
  { to: "/leaderboard", label: "Rang lista", icon: TrophyIcon, end: true },
  { to: "/ponavljanje", label: "Ponavljanje", icon: LayersIcon, end: true },
  { to: "/profile", label: "Moj profil", icon: UserIcon, end: true },
];

const pillClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors ${
    isActive
      ? "bg-white font-bold text-brand-quiz shadow-sm dark:text-[#7c2e9e]"
      : "font-medium text-white/85 hover:bg-white/15 hover:text-white"
  }`;

const mobileRowClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
    isActive
      ? "bg-white font-bold text-brand-quiz shadow-sm dark:text-[#7c2e9e]"
      : "font-medium text-white/90 hover:bg-white/15"
  }`;

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex flex-1 flex-col items-center gap-0.5 px-1 pb-1 pt-2 text-[11px] transition-colors ${
    isActive
      ? "font-bold text-brand-nav dark:text-fuchsia-300"
      : "font-medium text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
  }`;

/* ── component ─────────────────────────────────────────────── */

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on every route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login"),
      onError: () => {
        setUser(null);
        navigate("/login");
      },
    });
  };

  const emailInitial = (user?.email?.trim().charAt(0) || "?").toUpperCase();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-40 shadow-md">
        <div className="h-1 bg-gradient-to-r from-amber-300 via-fuchsia-300 to-amber-300" aria-hidden />
        <nav
          aria-label="Glavna navigacija"
          className="bg-gradient-to-r from-brand-nav via-[#9c3fc7] to-brand-quiz text-white dark:from-[#7c2e9e] dark:via-[#6d2a8f] dark:to-[#5b2a6e]"
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
            {/* brand */}
            <Link
              to={user ? "/home" : "/"}
              className="flex min-w-0 items-center gap-2.5 rounded-lg"
              aria-label="+ULTRA kviz — početna"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner ring-1 ring-white/30">
                {BoltIcon("h-5 w-5")}
              </span>
              <span className="leading-none">
                <span className="block text-lg font-black tracking-wide">+ULTRA</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                  Kviz
                </span>
              </span>
              {isDemo && (
                <span className="ml-1 shrink-0 rounded-md bg-amber-300 px-1.5 py-0.5 text-[10px] font-black tracking-widest text-amber-950">
                  DEMO
                </span>
              )}
            </Link>

            {/* desktop links */}
            {user ? (
              <div className="hidden items-center gap-1 md:flex">
                {AUTH_TABS.map((t) => (
                  <NavLink key={t.to} to={t.to} end={t.end} className={pillClass}>
                    {t.icon("h-[18px] w-[18px]")}
                    {t.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink to="/admin/modules" className={pillClass}>
                    {ShieldIcon("h-[18px] w-[18px]")}
                    Admin
                  </NavLink>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <NavLink to="/login" className={pillClass}>
                  {LoginIcon("h-[18px] w-[18px]")}
                  Prijava
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-quiz shadow-sm transition-transform hover:-translate-y-px dark:text-[#7c2e9e]"
                >
                  {RegisterIcon("h-[18px] w-[18px]")}
                  Registracija
                </NavLink>
              </div>
            )}

            {/* right side */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>
              {user ? (
                <>
                  <span
                    className="hidden max-w-[200px] items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 ring-1 ring-white/20 lg:inline-flex"
                    title={user.email}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-brand-quiz dark:text-[#7c2e9e]">
                      {emailInitial}
                    </span>
                    <span className="truncate text-xs font-semibold text-white/95">{user.email}</span>
                    {isAdmin && (
                      <span className="shrink-0 rounded-full bg-amber-300 px-1.5 py-px text-[10px] font-black uppercase text-amber-950">
                        Admin
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    title="Odjava"
                    aria-label="Odjava"
                    className="hidden min-h-[40px] items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/25 disabled:opacity-50 md:inline-flex"
                  >
                    {LogoutIcon("h-[18px] w-[18px]")}
                    {logout.isPending ? "Odjava…" : "Odjava"}
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-quiz shadow-sm dark:text-[#7c2e9e] md:hidden"
                >
                  {RegisterIcon("h-[18px] w-[18px]")}
                  Registracija
                </Link>
              )}
              {/* hamburger */}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? "Zatvori meni" : "Otvori meni"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/15 md:hidden"
              >
                {open ? CloseIcon() : MenuIcon()}
              </button>
            </div>
          </div>

          {/* mobile dropdown panel */}
          {open && (
            <div className="border-t border-white/15 px-4 pb-4 pt-2 md:hidden">
              {user ? (
                <div className="flex flex-col gap-1">
                  <p className="flex items-center gap-2 truncate px-3 py-2 text-xs font-medium text-white/70">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-brand-quiz dark:text-[#7c2e9e]">
                      {emailInitial}
                    </span>
                    <span className="truncate">{user.email}</span>
                    {isAdmin && (
                      <span className="shrink-0 rounded-full bg-amber-300 px-1.5 py-px text-[10px] font-black uppercase text-amber-950">
                        Admin
                      </span>
                    )}
                  </p>
                  {AUTH_TABS.map((t) => (
                    <NavLink key={t.to} to={t.to} end={t.end} className={mobileRowClass}>
                      {t.icon()}
                      {t.label}
                    </NavLink>
                  ))}
                  {isAdmin && (
                    <NavLink to="/admin/modules" className={mobileRowClass}>
                      {ShieldIcon()}
                      Admin panel
                    </NavLink>
                  )}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Tema</span>
                    <ThemeSwitcher />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="mt-1 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-[15px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 disabled:opacity-50"
                  >
                    {LogoutIcon()}
                    {logout.isPending ? "Odjava…" : "Odjava"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink to="/login" className={mobileRowClass}>
                    {LoginIcon()}
                    Prijava
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[15px] font-bold text-brand-quiz shadow-sm dark:text-[#7c2e9e]"
                  >
                    {RegisterIcon()}
                    Registracija
                  </NavLink>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Tema</span>
                    <ThemeSwitcher />
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* mobile bottom tab bar (authenticated) */}
      {user && (
        <nav
          aria-label="Brza navigacija"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgb(0_0_0/0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden"
        >
          <div className="flex items-stretch px-1">
            {AUTH_TABS.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className={tabClass} aria-label={t.label}>
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden
                      className={`absolute top-0 h-1 w-10 rounded-full transition-colors ${
                        isActive ? "bg-brand-nav dark:bg-fuchsia-400" : "bg-transparent"
                      }`}
                    />
                    {t.icon("h-6 w-6")}
                    {t.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
