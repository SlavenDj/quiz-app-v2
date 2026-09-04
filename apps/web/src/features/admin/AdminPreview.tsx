import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuizDetail } from "./api";
import { MultiInput, SingleInput, TextInput } from "../quiz/QuestionInputs";
import { Badge } from "../../components/ui/Badge";
import { Button, buttonClasses } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

interface AdminAnswer {
  id: number;
  body: string;
  isCorrect: boolean;
}

interface AdminQuestion {
  id: number;
  type: string;
  bodyHtml: string;
  imageUrl: string | null;
  expectedText: string | null;
  answers: AdminAnswer[];
}

interface AnswerState {
  answerIds: number[];
  text: string;
}

function emptyAnswer(): AnswerState {
  return { answerIds: [], text: "" };
}

function isAnswered(q: AdminQuestion, a: AnswerState | undefined): boolean {
  if (!a) return false;
  if (q.type === "text") return a.text.trim().length > 0;
  return a.answerIds.length > 0;
}

function isCorrect(q: AdminQuestion, a: AnswerState | undefined): boolean {
  const ans = a ?? emptyAnswer();
  if (q.type === "single") {
    const correctIds = q.answers.filter((x) => x.isCorrect).map((x) => x.id);
    return correctIds.length === 1 && ans.answerIds.length === 1 && ans.answerIds[0] === correctIds[0];
  }
  if (q.type === "multiple") {
    if (ans.answerIds.length === 0) return false;
    const correct = [...q.answers.filter((x) => x.isCorrect).map((x) => x.id)].sort((x, y) => x - y);
    const selected = [...ans.answerIds].sort((x, y) => x - y);
    if (correct.length !== selected.length) return false;
    return correct.every((id, i) => id === selected[i]);
  }
  // text
  if (q.expectedText == null) return false;
  return ans.text.trim().toLowerCase() === q.expectedText.trim().toLowerCase();
}

export function AdminPreview() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuizDetail(quizId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [finished, setFinished] = useState(false);

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        Greska: {(error as Error).message}
      </p>
    );

  const questions: AdminQuestion[] = data?.questions ?? [];
  if (questions.length === 0)
    return (
      <div className="flex flex-col gap-4">
        <Link
          to="/admin/modules"
          className="inline-flex w-fit items-center rounded border border-brand-quiz px-3 py-1.5 text-sm font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20 dark:text-fuchsia-300"
        >
          ← Nazad
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="break-words text-xl font-bold">Pregled kviza: {data?.name ?? ""}</h1>
          <Badge tone="brand">Preview mode — pokusaji se ne evidentiraju</Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Kviz nema pitanja.</p>
      </div>
    );

  const safeIndex = Math.min(index, questions.length - 1);
  const q = questions[safeIndex];
  const val = answers[q.id] ?? emptyAnswer();
  const answeredCount = questions.filter((x) => isAnswered(x, answers[x.id])).length;

  const setAnswer = (questionId: number, v: AnswerState) =>
    setAnswers((prev) => ({ ...prev, [questionId]: v }));

  if (finished) {
    const results = questions.map((x) => ({ q: x, ok: isCorrect(x, answers[x.id]) }));
    const score = results.filter((r) => r.ok).length;
    return (
      <div className="flex flex-col gap-4">
        <Link
          to="/admin/modules"
          className="inline-flex w-fit items-center rounded border border-brand-quiz px-3 py-1.5 text-sm font-medium text-brand-quiz transition-colors hover:bg-brand-muted/20 dark:text-fuchsia-300"
        >
          ← Nazad na module
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="break-words text-xl font-bold">Pregled kviza: {data.name}</h1>
          <Badge tone="brand">Preview mode — pokusaji se ne evidentiraju</Badge>
        </div>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-semibold">
              Rezultat pregleda: {score}/{questions.length}
            </p>
            <Badge tone={score === questions.length ? "success" : "neutral"}>
              {score}/{questions.length}
            </Badge>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setFinished(false)}
              className="min-h-[44px] flex-1 text-sm sm:flex-none"
            >
              Nazad na pregled
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAnswers({});
                setIndex(0);
                setFinished(false);
              }}
              className="min-h-[44px] flex-1 text-sm sm:flex-none"
            >
              Ponovi pregled
            </Button>
          </div>
        </Card>
        {results.map(({ q: item, ok }, i) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Pitanje {i + 1}</p>
              <Badge tone={ok ? "success" : "danger"}>{ok ? "Tacno" : "Netacno"}</Badge>
            </div>
            <div
              className="mt-2 min-w-0 break-words text-base text-gray-900 dark:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
            />
            {item.type === "text" ? (
              <div className="mt-2 text-sm">
                <p className="break-words text-gray-700 dark:text-zinc-300">
                  Vas odgovor:{" "}
                  <span className="font-medium">{answers[item.id]?.text.trim() || "—"}</span>
                </p>
                <p className="mt-1 break-words text-gray-700 dark:text-zinc-300">
                  Ocekivani odgovor:{" "}
                  <span className="font-medium">{item.expectedText ?? "—"}</span>
                </p>
              </div>
            ) : (
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {item.answers.map((a) => (
                  <li
                    key={a.id}
                    className={`break-words rounded border px-2 py-1 ${
                      a.isCorrect
                        ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                        : "border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {a.body}
                    {a.isCorrect ? " ✓" : ""}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    );
  }

  const playQ = {
    questionId: q.id,
    type: q.type,
    bodyHtml: q.bodyHtml,
    imageUrl: q.imageUrl,
    answers: q.answers.map((a) => ({ id: a.id, body: a.body })),
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/admin/modules"
        className={buttonClasses("ghost", "sm", "w-fit border")}
      >
        ← Nazad
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="break-words text-xl font-bold">Pregled kviza: {data.name}</h1>
        <Badge tone="brand">Preview mode — pokusaji se ne evidentiraju</Badge>
      </div>
      <p className="text-xs text-gray-500 dark:text-zinc-400">
        Odgovoreno: {answeredCount}/{questions.length} | Pitanje {safeIndex + 1}/{questions.length}
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((x, i) => {
          const done = isAnswered(x, answers[x.id]);
          const current = i === safeIndex;
          return (
            <button
              key={x.id}
              onClick={() => setIndex(i)}
              disabled={i === safeIndex}
              aria-label={`Pitanje ${i + 1}${done ? " (odgovoreno)" : ""}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done
                  ? "bg-brand-nav text-white"
                  : "border border-brand-muted/60 bg-white text-gray-700 hover:border-brand-quiz dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              } ${current ? "ring-2 ring-brand-quiz ring-offset-2" : ""} disabled:cursor-default`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <Card>
        <div
          className="min-w-0 break-words text-base text-gray-900 dark:text-zinc-100"
          dangerouslySetInnerHTML={{ __html: q.bodyHtml }}
        />
        {q.imageUrl && (
          <img src={q.imageUrl} alt="" className="mt-3 w-full max-w-[300px] rounded-card object-cover" />
        )}
        <div className="mt-4">
          {q.type === "single" && (
            <SingleInput q={playQ} value={val} onChange={(v) => setAnswer(q.id, v)} />
          )}
          {q.type === "multiple" && (
            <MultiInput q={playQ} value={val} onChange={(v) => setAnswer(q.id, v)} />
          )}
          {q.type === "text" && <TextInput value={val} onChange={(v) => setAnswer(q.id, v)} />}
        </div>
      </Card>
      <div className="flex gap-3">
        <Button
          variant="primary"
          disabled={safeIndex === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="min-h-[44px] flex-1 text-sm sm:flex-none"
        >
          Nazad
        </Button>
        {safeIndex < questions.length - 1 ? (
          <Button
            variant="primary"
            onClick={() => setIndex((i) => i + 1)}
            className="min-h-[44px] flex-1 text-sm sm:flex-none"
          >
            Dalje
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => setFinished(true)}
            className="min-h-[44px] flex-1 text-sm sm:flex-none"
          >
            Zavrsi pregled
          </Button>
        )}
      </div>
    </div>
  );
}
