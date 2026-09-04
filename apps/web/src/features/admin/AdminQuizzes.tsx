import { Link, useParams } from "react-router-dom";
import { Fragment, useState } from "react";
import { useAdminModuleQuizzes, useCreateQuiz, useDeleteQuiz } from "./api";
import { Badge } from "../../components/ui/Badge";
import { Button, buttonClasses } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Checkbox } from "../../components/ui/Checkbox";
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
    return <Alert tone="error">Greska: {(error as Error).message}</Alert>;

  return (
    <div className="flex flex-col gap-4">
      <Link to="/admin/modules" className={buttonClasses("ghost", "sm", "w-fit border")}>
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
          <Checkbox
            label="Obavijesti studente"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="whitespace-nowrap"
          />
          <Button type="submit" loading={create.isPending}>
            Dodaj kviz
          </Button>
        </form>
      </Card>
      {data.quizzes.map((q: any) => (
        <Fragment key={q.quizId}>
          <Card className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-semibold">{q.quizName}</h3>
            {q.description ? (
              <p className="mt-0.5 break-words text-sm text-gray-600 dark:text-zinc-400">{q.description}</p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {q.status ? (
                <Badge tone={q.status === "published" ? "success" : "neutral"}>
                  {q.status === "published" ? "Objavljeno" : "Nacrt"}
                </Badge>
              ) : null}
              {q.scheduledStartAt && new Date(q.scheduledStartAt) > new Date() ? (
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  Zakazano: {new Date(q.scheduledStartAt).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/admin/quiz/${q.quizId}/preview`} className={buttonClasses("outline", "sm")}>
              Pregledaj
            </Link>
            <Link to={`/admin/quiz/${q.quizId}/edit`} className={buttonClasses("primary", "sm")}>
              Uredi pitanja
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (confirm(`Obrisati ${q.quizName}?`)) await del.mutateAsync(q.quizId);
              }}
            >
              Obrisi
            </Button>
            <Button
              variant="outline"
              size="sm"
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
