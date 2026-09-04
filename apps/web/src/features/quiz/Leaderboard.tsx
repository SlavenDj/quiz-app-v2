import { useState } from "react";
import { Link } from "react-router-dom";
import { useLeaderboard, useEditions } from "./api";
import { useAuthStore } from "../../stores/auth";
import { avatarSrc } from "../../lib/avatar";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

const MEDAL_STYLES = [
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-gray-100 text-gray-700 border-gray-300",
  "bg-orange-100 text-orange-800 border-orange-300",
];

export function Leaderboard() {
  const [season, setSeason] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const { data, isLoading, error } = useLeaderboard(season || undefined, month || undefined);
  const { data: editions } = useEditions();
  const currentUserId = useAuthStore((s) => s.user?.id);
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) return <p className="page-container text-gray-500">Još nema rezultata na rang listi.</p>;
  const top3 = rows.slice(0, 3);
  return (
    <div className="page-container">
      <h1 className="mb-4 break-words text-2xl font-bold text-gray-900">Rang lista (prvi pokusaji)</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={season} onChange={(e) => setSeason(e.target.value)} className="rounded border px-2 py-2 text-sm" aria-label="Sezona">
          <option value="">Sve sezone</option>
          {(Array.isArray(editions) ? editions : []).map((e: string) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border px-2 py-2 text-sm"
          aria-label="Mjesec"
        />
        {(season || month) && (
          <button onClick={() => { setSeason(""); setMonth(""); }} className="rounded border px-3 py-2 text-sm text-gray-600">
            Reset
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3.map((r: any, i: number) => {
          const isMe = r.userId === currentUserId;
          return (
            <Link
              key={r.userId}
              to={`/userinfo/${r.userId}`}
              className="min-w-0 rounded-card transition-shadow hover:shadow-card"
            >
            <Card
              className={`flex min-w-0 flex-col items-center gap-2 rounded-card text-center shadow-card ${
                isMe ? "border-brand-nav ring-2 ring-brand-nav" : ""
              }`}
            >
              <span
                aria-hidden
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold ${MEDAL_STYLES[i] ?? "bg-gray-100 text-gray-700"}`}
              >
                {i + 1}
              </span>
              {avatarSrc(r.avatarFile, `${r.firstName} ${r.lastName}`) ? (
                <img
                  src={avatarSrc(r.avatarFile, `${r.firstName} ${r.lastName}`)!}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted/25 text-lg font-bold text-brand-quiz">
                  ?
                </span>
              )}
              <p className="min-w-0 break-words text-sm font-semibold text-gray-900">
                #{r.rank} {r.firstName} {r.lastName}
                {isMe && " (vi)"}
              </p>
              <p className="text-sm text-gray-500">
                {r.totalScore} bodova ({r.quizzesPlayed} kviza)
              </p>
            </Card>
            </Link>
          );
        })}
      </div>
      <ol className="mt-4 flex flex-col gap-2">
        {rows.map((r: any) => {
          const isMe = r.userId === currentUserId;
          return (
            <li key={r.userId} className="min-w-0">
              <Link
                to={`/userinfo/${r.userId}`}
                className={`flex min-w-0 items-center gap-3 rounded-card border bg-white px-3 py-2 shadow-card transition-shadow hover:shadow-card ${
                  isMe ? "border-brand-nav ring-2 ring-brand-nav" : "border-brand-muted/40"
                }`}
              >
              {avatarSrc(r.avatarFile, `${r.firstName} ${r.lastName}`) ? (
                <img
                  src={avatarSrc(r.avatarFile, `${r.firstName} ${r.lastName}`)!}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted/25 text-sm font-bold text-brand-quiz">
                  ?
                </span>
              )}
              <span className="w-8 shrink-0 text-sm font-bold text-gray-500">#{r.rank}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                {r.firstName} {r.lastName}
                {isMe && " (vi)"}
              </span>
              <span className="shrink-0 text-sm text-gray-500">
                {r.totalScore} bodova ({r.quizzesPlayed} kviza)
              </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
