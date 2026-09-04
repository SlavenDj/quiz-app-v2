import { Link, useNavigate } from "react-router-dom";
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

  return (
    <nav className="bg-[#AD45D1] text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={user ? "/home" : "/"} className="text-xl font-bold tracking-wide">
          +ULTRA
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {!user ? (
            <>
              <Link to="/login" className="hover:underline">
                Prijava
              </Link>
              <Link to="/register" className="hover:underline">
                Registracija
              </Link>
            </>
          ) : (
            <>
              <Link to="/home" className="hover:underline">
                Pocetna
              </Link>
              <Link to="/leaderboard" className="hover:underline">
                Rang lista
              </Link>
              <Link to="/profile" className="hover:underline">
                Moj profil
              </Link>
              {user.role === "admin" && (
                <Link to="/admin/modules" className="hover:underline">
                  Admin
                </Link>
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
