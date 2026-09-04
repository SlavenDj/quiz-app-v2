import { Link, useParams } from "react-router-dom";
import { Fragment, useState } from "react";
import { useAdminModuleQuizzes, useCreateQuiz, useDeleteQuiz } from "./api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { TextInput } from "../../components/ui/TextInput";
import { QuestionBank } from "./QuestionBank";

export function AdminQuizzes() {
  const { id } = useParams();
  const moduleId = Number(id);
  const { data, isLoading, error } = useAdminModuleQuizzes(moduleId);
  const create = useCreateQuiz(moduleId);
  const del = useDeleteQuiz();
  const [name, setName] = useState("");
  const [notify, setNotify] = useState(true);
  const [bankQuizId, setBankQuizId] = useState<number | null>(null);

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
        to="/admin/modules"
        className="inline-flex w-fit items-center rounded border border-brand-quiz px-3 py-1.5 text-sm font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20"
      >
        ← Nazad
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="break-words text-xl font-bold">
          {data.name} — kvizovi ({data.quizzes.length})
        </h1>
        <Badge tone="brand">{data.quizzes.length}</Badge>
      </div>
      <Card>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            await create.mutateAsync({ name, description: "", notify });
            setName("");
          }}
        >
          <div className="min-w-0 flex-1">
            <TextInput
              placeholder="Naziv kviza"
              aria-label="Naziv kviza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <label className="flex items-center gap-1.5 whitespace-nowrap text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Obavijesti studente
          </label>
          <Button type="submit">Dodaj kviz</Button>
        </form>
      </Card>
      {data.quizzes.map((q: any) => (
        <Fragment key={q.quizId}>
          <Card className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-semibold">{q.quizName}</h3>
            {q.description ? (
              <p className="mt-0.5 break-words text-sm text-gray-600">{q.description}</p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {q.status ? (
                <Badge tone={q.status === "published" ? "success" : "neutral"}>
                  {q.status === "published" ? "Objavljeno" : "Nacrt"}
                </Badge>
              ) : null}
              {q.scheduledStartAt && new Date(q.scheduledStartAt) > new Date() ? (
                <span className="text-xs text-gray-500">
                  Zakazano: {new Date(q.scheduledStartAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/quiz/${q.quizId}/preview`}
              className="rounded border border-brand-quiz px-4 py-2 text-sm font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20"
            >
              Pregledaj
            </Link>
            <Link
              to={`/admin/quiz/${q.quizId}/edit`}
              className="rounded bg-brand-nav px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-quiz"
            >
              Uredi pitanja
            </Link>
            <Button
              variant="danger"
              className="text-sm"
              onClick={async () => {
                if (confirm(`Obrisati ${q.quizName}?`)) await del.mutateAsync(q.quizId);
              }}
            >
              Obrisi
            </Button>
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => setBankQuizId(bankQuizId === q.quizId ? null : q.quizId)}
            >
              Iz banke
            </Button>
          </div>
        </Card>
          {bankQuizId === q.quizId ? <QuestionBank quizId={q.quizId} /> : null}
        </Fragment>
      ))}
    </div>
  );
}
