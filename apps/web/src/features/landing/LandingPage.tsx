import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { Badge } from "../../components/ui/Badge";

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;

  return (
    <div className="flex flex-col gap-8 py-10 sm:py-16">
      <section className="flex flex-col items-start gap-4">
        <Badge tone="brand">Kviz platforma</Badge>
        <p className="text-2xl font-extrabold tracking-tight text-brand-quiz">+ULTRA</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">+ULTRA Kviz</h1>
        <p className="max-w-xl text-gray-600">
          Rješavaj kvizove, takmiči se na rang listi i testiraj svoje znanje.
        </p>
        <nav className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/register"
            className="rounded bg-brand-nav px-4 py-2 text-center font-medium text-white transition-colors hover:bg-brand-quiz"
          >
            Registracija
          </Link>
          <Link
            to="/login"
            className="rounded border border-brand-quiz bg-transparent px-4 py-2 text-center font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20"
          >
            Prijava
          </Link>
        </nav>
      </section>
      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="rounded-lg border border-brand-muted bg-white p-4 text-sm text-gray-700">
          <span className="mb-1 block font-semibold text-brand-quiz">Rješavaj kvizove</span>
          Biraj module i testiraj svoje znanje.
        </li>
        <li className="rounded-lg border border-brand-muted bg-white p-4 text-sm text-gray-700">
          <span className="mb-1 block font-semibold text-brand-quiz">Takmiči se</span>
          Takmiči se na rang listi sa ostalim igračima.
        </li>
        <li className="rounded-lg border border-brand-muted bg-white p-4 text-sm text-gray-700">
          <span className="mb-1 block font-semibold text-brand-quiz">Prati napredak</span>
          Prati svoje rezultate i napredak kroz module.
        </li>
      </ul>
    </div>
  );
}
