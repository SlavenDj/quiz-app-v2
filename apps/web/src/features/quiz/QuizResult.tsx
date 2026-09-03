import { Link, useParams } from "react-router-dom";
import { useAttempt } from "./api";

export function QuizResult() {
  const { attemptId } = useParams();
  const { data, isLoading, error } = useAttempt(Number(attemptId));
  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;
  return (
    <div>
      <h1>
        {data.quizName}: {data.score}/{data.maxScore}
      </h1>
      <p>Vrijeme: {data.durationSec}s</p>
      {data.review.map((r: any, i: number) => (
        <div key={r.questionId}>
          <p>
            Pitanje {i + 1} ({r.type})
          </p>
          <div dangerouslySetInnerHTML={{ __html: r.bodyHtml }} />
          {r.type === "text" ? (
            <p>Vas odgovor: {r.userText ?? "-"}</p>
          ) : (
            <ul>
              {r.answers.map((a: any) => (
                <li key={a.id}>
                  {a.isCorrect ? "[tacno]" : ""} {a.body}
                  {r.userAnswerIds.includes(a.id) ? " (vas izbor)" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <Link to="/home">Nazad na module</Link> | <Link to="/leaderboard">Rang lista</Link>
    </div>
  );
}
