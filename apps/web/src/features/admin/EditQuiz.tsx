import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAddQuestion, useQuizDetail, useUpdateQuiz } from "./api";
import { QuizMetaForm } from "./QuizMetaForm";
import { QuestionCard } from "./QuestionCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

const selectClassName =
  "rounded border border-brand-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-quiz";

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function QuizStatusForm({ quizId, quiz }: { quizId: number; quiz: any }) {
  const updateQuiz = useUpdateQuiz(quizId);
  const [status, setStatus] = useState<string>(quiz.status ?? "published");
  const [scheduledStartAt, setScheduledStartAt] = useState<string>(
    toDatetimeLocal(quiz.scheduledStartAt)
  );

  return (
    <Card title="Status i zakazivanje">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateQuiz.mutateAsync({
            status,
            scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt).toISOString() : null,
          });
        }}
      >
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          Status:
          <select className={selectClassName} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Nacrt</option>
            <option value="published">Objavljeno</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          Zakazani pocetak:
          <input
            type="datetime-local"
            className="w-full rounded border border-brand-muted px-3 py-2 text-sm outline-none focus:border-brand-quiz"
            value={scheduledStartAt}
            onChange={(e) => setScheduledStartAt(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit">Spasi status</Button>
        </div>
      </form>
    </Card>
  );
}

export function EditQuiz() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuizDetail(quizId);
  const addQ = useAddQuestion(quizId);
  const [newType, setNewType] = useState("single");

  if (isLoading) return <Spinner />;  if (error)
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
      <QuizStatusForm quizId={quizId} quiz={data} />
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
