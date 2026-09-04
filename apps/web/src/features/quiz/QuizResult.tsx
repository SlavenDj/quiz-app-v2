import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { useAttempt } from "./api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function QuizResult() {
  const { attemptId } = useParams();
  const { data, isLoading, error } = useAttempt(Number(attemptId));
  const firedRef = useRef(false);
  const passed = data && data.maxScore > 0 ? data.score / data.maxScore >= 0.5 : false;
  useEffect(() => {
    if (passed && !firedRef.current) {
      firedRef.current = true;
      confetti();
    }
  }, [passed]);
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger dark:text-red-400">Greska: {(error as Error).message}</p>;
  return (
    <div className="page-container">
      <Card className="mx-auto w-full max-w-2xl rounded-card text-center shadow-card">
        <Badge tone={passed ? "success" : "danger"}>{passed ? "Polozio/la" : "Nije polozeno"}</Badge>
        <h1 className="mt-2 break-words text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {data.quizName}: {data.score}/{data.maxScore}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Vrijeme: {Math.floor((data.durationSec ?? 0) / 60)}:{String((data.durationSec ?? 0) % 60).padStart(2, "0")}</p>
      </Card>
      <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-4">
        {data.review.map((r: any, i: number) => {
          const correctIds: number[] = (r.answers ?? []).filter((a: any) => a.isCorrect).map((a: any) => a.id);
          const userIds: number[] = r.userAnswerIds ?? [];
          const questionCorrect =
            r.type === "text"
              ? null
              : correctIds.length === userIds.length && correctIds.every((id) => userIds.includes(id));
          return (
            <Card key={r.questionId} className="min-w-0 rounded-card shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  Pitanje {i + 1} ({r.type})
                </p>
                {questionCorrect === null ? (
                  <Badge tone="neutral">Tekstualni odgovor</Badge>
                ) : questionCorrect ? (
                  <Badge tone="success">Tacno</Badge>
                ) : (
                  <Badge tone="danger">Netacno</Badge>
                )}
              </div>
              <div
                className="mt-2 min-w-0 break-words text-sm text-gray-900 dark:text-zinc-100 sm:text-base"
                dangerouslySetInnerHTML={{ __html: r.bodyHtml }}
              />
              {r.type === "text" ? (
                <p className="mt-2 min-w-0 break-words text-sm text-gray-700 dark:text-zinc-300">Vas odgovor: {r.userText ?? "-"}</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {r.answers.map((a: any) => {
                    const picked = (r.userAnswerIds ?? []).includes(a.id);
                    return (
                      <li
                        key={a.id}
                        className="flex min-w-0 flex-wrap items-center gap-2 rounded-card border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 flex-1 break-words text-gray-900 dark:text-zinc-100">{a.body}</span>
                        {a.isCorrect && picked && <Badge tone="success">Tačno</Badge>}
                        {a.isCorrect && !picked && <Badge tone="brand">Propušteno</Badge>}
                        {!a.isCorrect && picked && <Badge tone="danger">Pogrešno</Badge>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={() => window.print()} className="flex-1">
          Štampaj
        </Button>
        <Link
          to="/home"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded border border-brand-quiz bg-transparent px-4 py-2 font-medium text-brand-quiz dark:text-fuchsia-300 transition-colors hover:bg-brand-muted/20"
        >
          Nazad na module
        </Link>
        <Link
          to="/leaderboard"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded bg-brand-nav px-4 py-2 font-medium text-white transition-colors hover:bg-brand-quiz"
        >
          Rang lista
        </Link>
      </div>
    </div>
  );
}
