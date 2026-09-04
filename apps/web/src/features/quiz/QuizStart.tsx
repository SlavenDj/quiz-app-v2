import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuiz, useStartPlay } from "./api";
import { AttemptHistory } from "./AttemptHistory";
import { useCountdown } from "../../lib/useCountdown";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function QuizStart() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuiz(quizId);
  const navigate = useNavigate();
  const startPlay = useStartPlay();
  const [earlyMsg, setEarlyMsg] = useState<string | null>(null);
  const countdown = useCountdown(data?.scheduledStartAt ?? null);
  const scheduledFuture = !!data?.scheduledStartAt && countdown !== null;

  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger dark:text-red-400">Greska: {(error as Error).message}</p>;

  return (
    <div className="page-container">
      <Link
        to={data.moduleId ? `/modules/${data.moduleId}` : "/home"}
        className="mb-4 inline-flex min-h-[44px] items-center font-medium text-brand-quiz dark:text-fuchsia-300 hover:underline"
      >
        ← Nazad
      </Link>
      <Card className="mx-auto w-full max-w-2xl rounded-card shadow-card">
        <h1 className="break-words text-2xl font-bold text-gray-900 dark:text-zinc-100">{data.name}</h1>
        <p className="mt-2 min-w-0 break-words text-sm text-gray-600 dark:text-zinc-400 sm:text-base">{data.description}</p>
        <div
          className="mt-3 min-w-0 break-words text-sm text-gray-700 dark:text-zinc-300 sm:text-base"
          dangerouslySetInnerHTML={{ __html: data.introHtml }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="brand">Pitanja: {data.questionCount}</Badge>
          <Badge tone="brand">Vrijeme: {Math.floor(data.timeLimitSec / 60)} min</Badge>
          <Badge tone="brand">
            Pokusaji: {data.myAttempts}/{data.maxAttempts}
          </Badge>
        </div>
        <div className="mt-5">
          {scheduledFuture && (
            <p className="mb-2 rounded-card bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
              Počinje za {countdown}
            </p>
          )}
          {earlyMsg && <p className="mb-2 rounded-card bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-status-danger dark:text-red-400">{earlyMsg}</p>}
          {data.canAttempt ? (
            <Button
              variant="primary"
              disabled={scheduledFuture || startPlay.isPending}
              onClick={() =>
                startPlay.mutate(quizId, {
                  onSuccess: () => navigate(`/quiz/${quizId}/play`),
                  onError: (e: any) => {
                    const details = e?.details ?? e?.response?.details;
                    const startsAt = details?.startsAt;
                    setEarlyMsg(
                      startsAt ? `Kviz još nije počeo. Počinje: ${new Date(startsAt).toLocaleString()}` : (e as Error).message
                    );
                  },
                })
              }
              className="min-h-[44px] w-full text-base sm:w-auto"
            >
              {scheduledFuture ? `Počinje za ${countdown}` : "Zapocni kviz"}
            </Button>
          ) : (
            <p className="rounded-card bg-gray-100 dark:bg-zinc-800 px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">Nema vise pokusaja.</p>
          )}
        </div>
      </Card>
      <div className="mx-auto mt-6 w-full max-w-2xl">
        <AttemptHistory quizId={quizId} />
      </div>
    </div>
  );
}
