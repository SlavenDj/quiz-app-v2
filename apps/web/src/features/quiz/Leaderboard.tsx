import { useLeaderboard } from "./api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function Leaderboard() {
  const { data, isLoading, error } = useLeaderboard();
  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) return <p>Još nema rezultata na rang listi.</p>;
  return (
    <div>
      <h1>Rang lista (prvi pokusaji)</h1>
      <ol>
        {rows.map((r: any) => (
          <li key={r.userId}>
            {r.avatarFile ? (
              <img src={`${API_URL}/uploads/${r.avatarFile}`} width={32} alt="" />
            ) : (
              <span>?</span>
            )}{" "}
            #{r.rank} {r.firstName} {r.lastName} — {r.totalScore} bodova ({r.quizzesPlayed} kviza)
          </li>
        ))}
      </ol>
    </div>
  );
}
