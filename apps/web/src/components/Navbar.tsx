import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useLogout } from "../features/auth/hooks";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login"),
      onError: () => {
        setUser(null);
        navigate("/login");
      },
    });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "font-bold underline underline-offset-4" : "hover:underline";

  return (
    <nav className="bg-[#AD45D1] text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={user ? "/home" : "/"} className="text-xl font-bold tracking-wide">
          +ULTRA
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {!user ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Prijava
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registracija
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/home" className={linkClass}>
                Pocetna
              </NavLink>
              <NavLink to="/leaderboard" className={linkClass}>
                Rang lista
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Moj profil
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin/modules" className={linkClass}>
                  Admin
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="rounded bg-white/20 px-3 py-1 hover:bg-white/30 disabled:opacity-50"
              >
                Odjava
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
