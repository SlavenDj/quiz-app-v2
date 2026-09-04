import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAddQuestion, useQuizDetail } from "./api";
import { QuizMetaForm } from "./QuizMetaForm";
import { QuestionCard } from "./QuestionCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

const selectClassName =
  "rounded border border-brand-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-quiz";

export function EditQuiz() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuizDetail(quizId);
  const addQ = useAddQuestion(quizId);
  const [newType, setNewType] = useState("single");

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Greska: {(error as Error).message}
      </p>
    );

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={data.moduleIds?.length ? `/admin/modules/${data.moduleIds[0]}` : "/admin/modules"}
        className="inline-flex w-fit items-center rounded border border-brand-quiz px-3 py-1.5 text-sm font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20"
      >
        ← Nazad
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="break-words text-xl font-bold">Uredi kviz: {data.name}</h1>
        <Badge tone="brand">pitanja: {data.questions.length}</Badge>
      </div>
      <QuizMetaForm key={quizId} quizId={quizId} quiz={data} />
      <h2 className="text-lg font-semibold">Pitanja ({data.questions.length})</h2>
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select className={selectClassName} value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="single">Jedan odgovor</option>
            <option value="multiple">Vise odgovora</option>
            <option value="text">Tekst</option>
          </select>
          <Button
            className="text-sm sm:w-fit"
            onClick={() => addQ.mutate({ bodyHtml: "<p>Novo pitanje</p>", type: newType })}
          >
            Dodaj pitanje
          </Button>
        </div>
      </Card>
      {data.questions.map((q: any) => (
        <QuestionCard key={q.id} quizId={quizId} q={q} />
      ))}
    </div>
  );
}
