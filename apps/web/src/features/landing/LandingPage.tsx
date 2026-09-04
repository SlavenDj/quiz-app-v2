import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;

  return (
    <main>
      <h1>+ULTRA Kviz</h1>
      <p>Rješavaj kvizove, takmiči se na rang listi i testiraj svoje znanje.</p>
      <nav>
        <Link to="/login">Prijava</Link>
        <Link to="/register">Registracija</Link>
      </nav>
    </main>
  );
}
