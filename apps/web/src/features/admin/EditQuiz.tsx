import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useAddAnswer,
  useAddQuestion,
  useDeleteAnswer,
  useDeleteQuestion,
  useDeleteQuestionImage,
  useQuizDetail,
  useUpdateAnswer,
  useUpdateQuestion,
  useUpdateQuiz,
  useUploadQuestionImage,
} from "./api";
import { RichEditor } from "./RichEditor";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { TextInput } from "../../components/ui/TextInput";

const inputClassName =
  "w-full rounded border border-brand-muted px-3 py-2 text-sm outline-none focus:border-brand-quiz";
const selectClassName =
  "rounded border border-brand-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-quiz";

function useDebouncedSave(delayMs = 800) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<(() => Promise<unknown>) | null>(null);
  const [saved, setSaved] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const save = (fn: () => Promise<unknown>) => {
    pending.current = fn;
    setSaved(false);
    setSaveError(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const toRun = pending.current;
      pending.current = null;
      timer.current = null;
      if (!toRun) return;
      try {
        await toRun();
        setSaved(true);
      } catch {
        setSaveError("Greska pri snimanju");
      }
    }, delayMs);
  };
  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current) {
      const toRun = pending.current;
      pending.current = null;
      toRun()
        .then(() => setSaved(true))
        .catch(() => setSaveError("Greska pri snimanju"));
    }
  }, []);
  return { save, saved, saveError };
}

function QuizMetaForm({ quizId, quiz }: { quizId: number; quiz: any }) {
  const updateQuiz = useUpdateQuiz(quizId);
  const [meta, setMeta] = useState({
    name: quiz.name,
    description: quiz.description,
    timeLimitSec: quiz.timeLimitSec,
    maxAttempts: quiz.maxAttempts,
    passPct: quiz.passPct,
  });

  return (
    <Card title="Osnovni podaci">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateQuiz.mutateAsync(meta);
        }}
      >
        <div className="min-w-0 sm:col-span-2">
          <TextInput
            label="Naziv kviza"
            value={meta.name}
            onChange={(e) => setMeta({ ...meta, name: e.target.value })}
            required
            minLength={3}
          />
        </div>
        <div className="min-w-0 sm:col-span-2">
          <TextInput
            label="Opis"
            value={meta.description}
            onChange={(e) => setMeta({ ...meta, description: e.target.value })}
            placeholder="Opis"
          />
        </div>
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          Limit (s):
          <input
            type="number"
            className={inputClassName}
            value={meta.timeLimitSec}
            onChange={(e) => setMeta({ ...meta, timeLimitSec: Number(e.target.value) })}
            min={60}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium">
          Pokusaji:
          <input
            type="number"
            className={inputClassName}
            value={meta.maxAttempts}
            onChange={(e) => setMeta({ ...meta, maxAttempts: Number(e.target.value) })}
            min={1}
            max={10}
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit">Spasi</Button>
        </div>
      </form>
    </Card>
  );
}

function QuestionCard({ quizId, q }: { quizId: number; q: any }) {
  const updateQ = useUpdateQuestion(quizId);
  const delQ = useDeleteQuestion(quizId);
  const addA = useAddAnswer(quizId);
  const updateA = useUpdateAnswer(quizId);
  const delA = useDeleteAnswer(quizId);
  const uploadImg = useUploadQuestionImage(quizId);
  const delImg = useDeleteQuestionImage(quizId);
  const { save, saved, saveError } = useDebouncedSave();
  const [newAnswer, setNewAnswer] = useState("");

  return (
    <Card className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={selectClassName}
          value={q.type}
          onChange={(e) => updateQ.mutate({ id: q.id, body: { type: e.target.value } })}
        >
          <option value="single">Jedan odgovor</option>
          <option value="multiple">Vise odgovora</option>
          <option value="text">Tekst</option>
        </select>
        {!saved && <Badge tone="progress">Snimanje...</Badge>}
        {saved && <Badge tone="success">Snimljeno</Badge>}
        {saveError && <Badge tone="danger">{saveError}</Badge>}
        <Button
          variant="danger"
          className="ml-auto text-sm"
          onClick={async () => {
            if (confirm("Obrisati pitanje?")) await delQ.mutateAsync(q.id);
          }}
        >
          Obrisi pitanje
        </Button>
      </div>
      <RichEditor key={`${q.id}-${q.bodyHtml}`} initialHtml={q.bodyHtml} onChange={(html) => save(() => updateQ.mutateAsync({ id: q.id, body: { bodyHtml: html } }))} />
      {q.type === "text" && (
        <input
          key={`${q.id}-${q.expectedText ?? ""}`}
          className={inputClassName}
          placeholder="Ocekivani odgovor (tacan tekst)"
          defaultValue={q.expectedText ?? ""}
          onBlur={(e) => updateQ.mutate({ id: q.id, body: { expectedText: e.target.value || null } })}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {q.imageUrl ? (
          <>
            <img
              src={q.imageUrl}
              alt=""
              className="max-h-40 rounded border border-brand-muted object-contain"
            />
            <Button variant="outline" className="text-sm" onClick={() => delImg.mutate(q.id)}>
              Ukloni sliku
            </Button>
          </>
        ) : (
          <input
            type="file"
            className="min-w-0 max-w-full text-sm"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImg.mutate({ questionId: q.id, file: f });
            }}
          />
        )}
      </div>
      {q.type !== "text" && (
        <div className="flex flex-col gap-2">
          {q.answers.map((a: any) => (
            <div key={`${a.id}-${a.body}`} className="flex flex-wrap items-center gap-2">
              {q.type === "single" ? (
                <input
                  type="radio"
                  className="h-4 w-4 shrink-0 accent-brand-quiz"
                  name={`correct-${q.id}`}
                  checked={a.isCorrect}
                  onChange={() => updateA.mutate({ id: a.id, body: { isCorrect: true } })}
                />
              ) : (
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-brand-quiz"
                  checked={a.isCorrect}
                  onChange={(e) => updateA.mutate({ id: a.id, body: { isCorrect: e.target.checked } })}
                />
              )}
              <input
                key={`${a.id}-${a.body}`}
                className={`${inputClassName} min-w-0 flex-1`}
                defaultValue={a.body}
                onBlur={(e) => {
                  if (e.target.value !== a.body) updateA.mutate({ id: a.id, body: { body: e.target.value } });
                }}
              />
              <Button
                variant="danger"
                className="shrink-0 px-2.5 py-1.5 text-sm"
                aria-label="Obrisi odgovor"
                onClick={() => delA.mutate(a.id)}
              >
                x
              </Button>
            </div>
          ))}
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newAnswer.trim()) return;
              await addA.mutateAsync({ questionId: q.id, body: { body: newAnswer, isCorrect: false } });
              setNewAnswer("");
            }}
          >
            <div className="min-w-0 flex-1">
              <TextInput
                placeholder="Novi odgovor"
                aria-label="Novi odgovor"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>
            <Button type="submit" className="text-sm">
              Dodaj
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}

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
