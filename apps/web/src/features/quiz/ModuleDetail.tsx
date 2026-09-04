import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useModule } from "./api";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function ModuleDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useModule(Number(id));
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "score" | "attempts">("name");
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  const quizzes = [...(data.quizzes ?? [])]
    .filter((q: any) => q.quizName.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sort === "score") return (b.lastScore ?? -1) - (a.lastScore ?? -1);
      if (sort === "attempts") return (a.myAttempts ?? 0) - (b.myAttempts ?? 0);
      return a.quizName.localeCompare(b.quizName);
    });
  return (
    <div className="page-container">
      <Link
        to="/home"
        className="mb-4 inline-flex min-h-[44px] items-center font-medium text-brand-quiz hover:underline"
      >
        ← Nazad
      </Link>
      <Card className="mb-4 rounded-card shadow-card">
        <h1 className="break-words text-2xl font-bold text-gray-900">
          Modul {data.moduleNumber}: {data.name}
        </h1>
        <p className="mt-2 min-w-0 break-words text-sm text-gray-600 sm:text-base">{data.longDesc}</p>
        <p className="mt-3 text-sm text-gray-500">Broj kvizova: {data.quizzes.length}</p>
      </Card>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraga kvizova..."
          className="min-h-[44px] flex-1 rounded border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "name" | "score" | "attempts")}
          className="min-h-[44px] rounded border border-gray-200 px-3 py-2 text-sm"
          aria-label="Sortiranje"
        >
          <option value="name">Naziv A-Z</option>
          <option value="score">Najviše bodova</option>
          <option value="attempts">Najmanje pokušaja</option>
        </select>
      </div>
      <div className="flex flex-col gap-4">
        {data.status !== "InProgress" && (
          <p className="rounded-card border border-brand-muted/40 bg-white px-3 py-2 text-sm text-gray-500 shadow-card">
            {data.status === "Locked" ? "Modul je zaključan — kvizovi će biti dostupni uskoro." : "Modul je završen."}
          </p>
        )}
        {quizzes.map((q: any) => (
          <Card key={q.quizId} className="flex min-w-0 flex-col gap-2 rounded-card shadow-card">
            <h3 className="break-words text-lg font-semibold text-gray-900">{q.quizName}</h3>
            <p className="min-w-0 break-words text-sm text-gray-600">{q.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>Bodovi: {q.lastScore ?? "-"}</span>
              <span aria-hidden>·</span>
              <span>
                Pokusaji: {q.myAttempts}/{q.maxAttempts}
              </span>
              <Badge tone={q.canAttempt ? "progress" : "locked"}>
                {q.canAttempt ? "Dostupno" : "Iskoristeno"}
              </Badge>
            </div>
            <div className="pt-1">
              {q.canAttempt && data.status === "InProgress" ? (
                <Link
                  to={`/quiz/${q.quizId}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded bg-brand-nav px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-quiz"
                >
                  Zapocni
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
                  {q.canAttempt ? "Modul nije aktivan" : "Nema vise pokusaja"}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
