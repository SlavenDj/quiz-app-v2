import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStartPlay, useSubmitQuiz, type PlayPayload } from "./api";
import { MultiInput, SingleInput, TextInput } from "./QuestionInputs";

function fmt(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

export function QuizPlay() {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();
  const start = useStartPlay();
  const submit = useSubmitQuiz(quizId);
  const [play, setPlay] = useState<PlayPayload | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { answerIds: number[]; text: string }>>({});
  const [left, setLeft] = useState(0);
  const submitted = useRef(false);

  useEffect(() => {
    start.mutate(quizId, {
      onSuccess: (p) => {
        setPlay(p);
        setLeft(p.timeLeftSec);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const doSubmit = async () => {
    if (!play || submitted.current) return;
    submitted.current = true;
    const res = await submit.mutateAsync({
      attemptId: play.attemptId,
      answers: play.questions.map((q) => ({
        questionId: q.questionId,
        answerIds: answers[q.questionId]?.answerIds ?? [],
        text: answers[q.questionId]?.text ?? "",
      })),
    });
    navigate(`/results/${res.attemptId}`);
  };

  useEffect(() => {
    if (!play) return;
    if (left <= 0) {
      doSubmit();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, play]);

  if (start.isPending || !play) return <p>Ucitavanje kviza...</p>;
  if (start.isError) return <p>Greska: {(start.error as Error).message}</p>;

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
          <button disabled={submit.isPending} onClick={doSubmit}>
            Zavrsi kviz
          </button>
        )}
      </div>
      {submit.isError && <p>{(submit.error as Error).message}</p>}
    </div>
  );
}
