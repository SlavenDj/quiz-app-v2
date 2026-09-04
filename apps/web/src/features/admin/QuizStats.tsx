import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

interface Stats {
  attempts: number;
  avgScore: number;
  avgDurationSec: number;
  perQuestion: { questionId: number; type: string; attempts: number; correct: number }[];
}

export function QuizStats() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz-stats", id],
    queryFn: () => api(`/api/admin/quizzes/${id}/stats`) as Promise<Stats>,
  });
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  const s = data as Stats;
  return (
    <div className="page-container">
      <Link to="/admin/modules" className="mb-4 inline-flex min-h-[44px] items-center font-medium text-brand-quiz hover:underline">
        ← Nazad na module
      </Link>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Statistika kviza #{id}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-gray-500">Pokušaja</p><p className="text-2xl font-bold">{s.attempts}</p></Card>
        <Card><p className="text-sm text-gray-500">Prosječan rezultat</p><p className="text-2xl font-bold">{s.avgScore.toFixed(2)}</p></Card>
        <Card><p className="text-sm text-gray-500">Prosječno vrijeme (s)</p><p className="text-2xl font-bold">{Math.round(s.avgDurationSec)}s</p></Card>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {s.perQuestion.map((q) => {
          const pct = q.attempts === 0 ? 0 : Math.round((q.correct / q.attempts) * 100);
          const bar = pct >= 50 ? "bg-green-500" : "bg-red-500";
          return (
            <Card key={q.questionId}>
              <p className="text-sm font-medium">Pitanje #{q.questionId} ({q.type}) — {q.correct}/{q.attempts} ({pct}%)</p>
              <div className="mt-2 h-2 w-full rounded bg-gray-200">
                <div className={`h-2 rounded ${bar}`} style={{ width: `${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
