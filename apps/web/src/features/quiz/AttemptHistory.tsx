import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

interface AttemptRow {
  attemptNo: number;
  score: number;
  maxScore: number;
  durationSec: number;
  submittedAt: string;
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AttemptHistory({ quizId }: { quizId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attempts", quizId],
    queryFn: () => api(`/api/quizzes/${quizId}/attempts`) as Promise<AttemptRow[]>,
  });

  if (isLoading) return <p className="text-sm text-gray-500">Učitavanje historije...</p>;
  if (error) return <p className="text-sm text-status-danger">Greška: {(error as Error).message}</p>;
  if (!data || data.length === 0) return <p className="text-sm text-gray-500">Nema prethodnih pokušaja.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="px-2 py-1">Pokušaj</th>
            <th className="px-2 py-1">Rezultat</th>
            <th className="px-2 py-1">Trajanje</th>
            <th className="px-2 py-1">Datum</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a) => (
            <tr key={a.attemptNo} className="border-t border-gray-100">
              <td className="px-2 py-1 font-medium">Pokušaj {a.attemptNo}</td>
              <td className="px-2 py-1">
                {a.score}/{a.maxScore}
              </td>
              <td className="px-2 py-1">{fmtDuration(a.durationSec ?? 0)}</td>
              <td className="px-2 py-1">{new Date(a.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
