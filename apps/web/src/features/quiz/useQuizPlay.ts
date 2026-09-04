import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStartPlay, useSubmitQuiz, type PlayPayload } from "./api";

export type Answers = Record<number, { answerIds: number[]; text: string }>;

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

function clearStored(quizId: number) {
  try {
    sessionStorage.removeItem(storageKey(quizId));
  } catch {
    // storage unavailable — ignore
  }
}

/** Play state machine: start/resume, countdown, persistence, submit.
 *  Render stays in QuizPlay; all transitions live here. */
export function useQuizPlay(quizId: number) {
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
      clearStored(quizId);
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

  const setAnswer = (questionId: number, v: { answerIds: number[]; text: string }) =>
    setAnswers((s) => ({ ...s, [questionId]: v }));

  const isAnswered = (questionId: number) => {
    const a = answers[questionId];
    return Boolean(a && (a.answerIds.length > 0 || a.text.trim() !== ""));
  };

  return { play, index, setIndex, answers, setAnswer, isAnswered, left, start, submit, handleStart, doSubmit };
}
