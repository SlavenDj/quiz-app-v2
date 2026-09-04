import { useParams } from "react-router-dom";
import { useQuizPlay } from "./useQuizPlay";
import { MultiInput, SingleInput, TextInput } from "./QuestionInputs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

function fmt(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

export function QuizPlay() {
  const { id } = useParams();
  const { play, index, setIndex, answers, setAnswer, isAnswered, left, start, submit, handleStart, doSubmit } =
    useQuizPlay(Number(id));

  if (start.isError) {
    return (
      <div className="page-container">
        <Card className="mx-auto w-full max-w-md rounded-card text-center shadow-card">
          <p className="break-words text-status-danger">Greska: {(start.error as Error).message}</p>
          <Button variant="primary" onClick={handleStart} className="mt-4 min-h-[44px] w-full">
            Pokušaj ponovo
          </Button>
        </Card>
      </div>
    );
  }
  if (start.isPending || !play) return <Spinner label="Ucitavanje kviza..." />;
  if (!play.questions || play.questions.length === 0)
    return <p className="page-container text-gray-500">Kviz nema pitanja</p>;

  const q = play.questions[index];
  const val = answers[q.questionId] ?? { answerIds: [], text: "" };
  const answered = play.questions.filter((x) => isAnswered(x.questionId)).length;
  const lowTime = left < 60;

  return (
    <div className="page-container">
      <div className="sticky top-0 z-10 -mx-4 border-b border-brand-muted/40 bg-white/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{play.quizName}</p>
          <p className={`text-sm font-bold tabular-nums sm:text-base ${lowTime ? "text-status-danger" : "text-gray-900"}`}>
            {fmt(left)}
          </p>
          <p className="w-full text-xs text-gray-500 sm:w-auto">
            Odgovoreno: {answered}/{play.questions.length} | Pitanje {index + 1}/{play.questions.length}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {play.questions.map((x, i) => {
          const done = isAnswered(x.questionId);
          const current = i === index;
          return (
            <button
              key={x.questionId}
              onClick={() => setIndex(i)}
              disabled={i === index}
              aria-label={`Pitanje ${i + 1}${done ? " (odgovoreno)" : ""}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done
                  ? "bg-brand-nav text-white"
                  : "border border-brand-muted/60 bg-white text-gray-700 hover:border-brand-quiz"
              } ${current ? "ring-2 ring-brand-quiz ring-offset-2" : ""} disabled:cursor-default`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <Card className="mt-4 rounded-card shadow-card">
        <div className="min-w-0 break-words text-base text-gray-900" dangerouslySetInnerHTML={{ __html: q.bodyHtml }} />
        {q.imageUrl && (
          <img src={q.imageUrl} alt="" className="mt-3 w-full max-w-[300px] rounded-card object-cover" />
        )}
        <div className="mt-4">
          {q.type === "single" && <SingleInput q={q} value={val} onChange={(v) => setAnswer(q.questionId, v)} />}
          {q.type === "multiple" && <MultiInput q={q} value={val} onChange={(v) => setAnswer(q.questionId, v)} />}
          {q.type === "text" && <TextInput value={val} onChange={(v) => setAnswer(q.questionId, v)} />}
        </div>
      </Card>
      <div className="mt-4 flex gap-3">
        <Button
          variant="primary"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="min-h-[44px] flex-1 sm:flex-none"
        >
          Nazad
        </Button>
        {index < play.questions.length - 1 ? (
          <Button variant="primary" onClick={() => setIndex((i) => i + 1)} className="min-h-[44px] flex-1 sm:flex-none">
            Dalje
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={submit.isPending}
            onClick={() => doSubmit().catch(() => {})}
            className="min-h-[44px] flex-1 sm:flex-none"
          >
            Zavrsi kviz
          </Button>
        )}
      </div>
      {submit.isError && (
        <Card className="mt-4 rounded-card border-status-danger/40 shadow-card">
          <p className="break-words text-sm text-status-danger">{(submit.error as Error).message}</p>
          <Button
            variant="primary"
            disabled={submit.isPending}
            onClick={() => doSubmit().catch(() => {})}
            className="mt-3 min-h-[44px] w-full sm:w-auto"
          >
            Pokušaj ponovo
          </Button>
        </Card>
      )}
    </div>
  );
}
