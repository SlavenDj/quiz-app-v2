import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuiz } from "./api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function QuizStart() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuiz(quizId);
  const navigate = useNavigate();

  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;

  return (
    <div className="page-container">
      <Link
        to={data.moduleId ? `/modules/${data.moduleId}` : "/home"}
        className="mb-4 inline-flex min-h-[44px] items-center font-medium text-brand-quiz hover:underline"
      >
        ← Nazad
      </Link>
      <Card className="mx-auto w-full max-w-2xl rounded-card shadow-card">
        <h1 className="break-words text-2xl font-bold text-gray-900">{data.name}</h1>
        <p className="mt-2 min-w-0 break-words text-sm text-gray-600 sm:text-base">{data.description}</p>
        <div
          className="mt-3 min-w-0 break-words text-sm text-gray-700 sm:text-base"
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
          {data.canAttempt ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/quiz/${quizId}/play`)}
              className="min-h-[44px] w-full text-base sm:w-auto"
            >
              Zapocni kviz
            </Button>
          ) : (
            <p className="rounded-card bg-gray-100 px-4 py-3 text-sm text-gray-600">Nema vise pokusaja.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
