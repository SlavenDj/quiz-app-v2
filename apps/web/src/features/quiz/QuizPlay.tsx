import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStartPlay, useSubmitQuiz, type PlayPayload } from "./api";
import { MultiInput, SingleInput, TextInput } from "./QuestionInputs";

function fmt(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

type Answers = Record<number, { answerIds: number[]; text: string }>;

function storageKey(quizId: number) {
  return `play-${quizId}`;
}

function readStored(quizId: number): { attemptId: number; answers: Answers; index: number } | null {
  try {
    const raw = sessionStorage.getItem(storageKey(quizId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function QuizPlay() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();
  const start = useStartPlay();
  const submit = useSubmitQuiz(quizId);
  const [play, setPlay] = useState<PlayPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [left, setLeft] = useState(0);
  const submitted = useRef(false);
  const startedRef = useRef(false);

  const handleStart = () => {
    start.mutate(quizId, {
      onSuccess: (p) => {
        setPlay(p);
        setLeft(p.timeLeftSec);
        const stored = readStored(quizId);
        if (stored && stored.attemptId === p.attemptId) {
          setAnswers(stored.answers ?? {});
          if (Number.isFinite(stored.index) && stored.index >= 0 && stored.index < p.questions.length) {
            setIndex(stored.index);
          }
        }
      },
    });
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    handleStart();
    return () => {
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (!play) return;
    try {
      sessionStorage.setItem(storageKey(quizId), JSON.stringify({ attemptId: play.attemptId, answers, index }));
    } catch {
      // storage unavailable — ignore
    }
  }, [answers, index, play, quizId]);

  const doSubmit = async () => {
    if (!play || submitted.current) return;
    submitted.current = true;
    try {
      const res = await submit.mutateAsync({
        attemptId: play.attemptId,
        answers: play.questions.map((q) => ({
          questionId: q.questionId,
          answerIds: answers[q.questionId]?.answerIds ?? [],
          text: answers[q.questionId]?.text ?? "",
        })),
      });
      try {
        sessionStorage.removeItem(storageKey(quizId));
      } catch {
        // ignore
      }
      navigate(`/results/${res.attemptId}`);
    } catch {
      submitted.current = false;
    }
  };

  useEffect(() => {
    if (!play) return;
    if (left <= 0) {
      doSubmit().catch(() => {});
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, play]);

  if (start.isError) {
    return (
      <div>
        <p>Greska: {(start.error as Error).message}</p>
        <button onClick={handleStart}>Pokušaj ponovo</button>
      </div>
    );
  }
  if (start.isPending || !play) return <p>Ucitavanje kviza...</p>;
  if (!play.questions || play.questions.length === 0) return <p>Kviz nema pitanja</p>;

  const q = play.questions[index];
  const val = answers[q.questionId] ?? { answerIds: [], text: "" };
  const setVal = (v: typeof val) => setAnswers((s) => ({ ...s, [q.questionId]: v }));
  const answered = play.questions.filter((x) => {
    const a = answers[x.questionId];
    return a && (a.answerIds.length > 0 || a.text.trim() !== "");
  }).length;

  return (
    <div>
      <p>
        {play.quizName} | Vrijeme: {fmt(left)} | Odgovoreno: {answered}/{play.questions.length} | Pitanje {index + 1}/
        {play.questions.length}
      </p>
      <div>
        {play.questions.map((x, i) => (
          <button key={x.questionId} onClick={() => setIndex(i)} disabled={i === index}>
            {i + 1}
          </button>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: q.bodyHtml }} />
      {q.imageUrl && <img src={q.imageUrl} alt="" style={{ maxWidth: 300 }} />}
      {q.type === "single" && <SingleInput q={q} value={val} onChange={setVal} />}
      {q.type === "multiple" && <MultiInput q={q} value={val} onChange={setVal} />}
      {q.type === "text" && <TextInput value={val} onChange={setVal} />}
      <div>
        <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Nazad
        </button>
        {index < play.questions.length - 1 ? (
          <button onClick={() => setIndex((i) => i + 1)}>Dalje</button>
        ) : (
          <button disabled={submit.isPending} onClick={() => doSubmit().catch(() => {})}>
            Zavrsi kviz
          </button>
        )}
      </div>
      {submit.isError && (
        <div>
          <p>{(submit.error as Error).message}</p>
          <button disabled={submit.isPending} onClick={() => doSubmit().catch(() => {})}>
            Pokušaj ponovo
          </button>
        </div>
      )}
    </div>
  );
}
