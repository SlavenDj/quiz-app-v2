import { useLeaderboard } from "./api";

export function Leaderboard() {
  const { data, isLoading, error } = useLeaderboard();
  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;
  return (
    <div>
      <h1>Rang lista (prvi pokusaji)</h1>
      <ol>
        {data.map((r: any) => (
          <li key={r.userId}>
            #{r.rank} {r.firstName} {r.lastName} — {r.totalScore} bodova ({r.quizzesPlayed} kviza)
          </li>
        ))}
      </ol>
    </div>
  );
}
