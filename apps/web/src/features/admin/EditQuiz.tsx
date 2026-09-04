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
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await updateQuiz.mutateAsync(meta);
      }}
    >
      <input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} required minLength={3} />
      <input value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} placeholder="Opis" />
      <label>
        Limit (s): <input type="number" value={meta.timeLimitSec} onChange={(e) => setMeta({ ...meta, timeLimitSec: Number(e.target.value) })} min={60} />
      </label>
      <label>
        Pokusaji: <input type="number" value={meta.maxAttempts} onChange={(e) => setMeta({ ...meta, maxAttempts: Number(e.target.value) })} min={1} max={10} />
      </label>
      <button>Spasi</button>
    </form>
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
    <div style={{ border: "1px solid #ccc", margin: "12px 0", padding: 12 }}>
      <select value={q.type} onChange={(e) => updateQ.mutate({ id: q.id, body: { type: e.target.value } })}>
        <option value="single">Jedan odgovor</option>
        <option value="multiple">Vise odgovora</option>
        <option value="text">Tekst</option>
      </select>{" "}
      {!saved && <span>Snimanje...</span>}
      {saved && <span>Snimljeno</span>}{" "}
      {saveError && <span>{saveError}</span>}{" "}
      <button
        onClick={async () => {
          if (confirm("Obrisati pitanje?")) await delQ.mutateAsync(q.id);
        }}
      >
        Obrisi pitanje
      </button>
      <RichEditor key={`${q.id}-${q.bodyHtml}`} initialHtml={q.bodyHtml} onChange={(html) => save(() => updateQ.mutateAsync({ id: q.id, body: { bodyHtml: html } }))} />
      {q.type === "text" && (
        <input
          key={`${q.id}-${q.expectedText ?? ""}`}
          placeholder="Ocekivani odgovor (tacan tekst)"
          defaultValue={q.expectedText ?? ""}
          onBlur={(e) => updateQ.mutate({ id: q.id, body: { expectedText: e.target.value || null } })}
        />
      )}
      <div>
        {q.imageUrl ? (
          <span>
            <img src={q.imageUrl} alt="" style={{ maxWidth: 200 }} />
            <button onClick={() => delImg.mutate(q.id)}>Ukloni sliku</button>
          </span>
        ) : (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImg.mutate({ questionId: q.id, file: f });
            }}
          />
        )}
      </div>
      {q.type !== "text" && (
        <div>
          {q.answers.map((a: any) => (
            <div key={`${a.id}-${a.body}`}>
              {q.type === "single" ? (
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={a.isCorrect}
                  onChange={() => updateA.mutate({ id: a.id, body: { isCorrect: true } })}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={a.isCorrect}
                  onChange={(e) => updateA.mutate({ id: a.id, body: { isCorrect: e.target.checked } })}
                />
              )}
              <input
                key={`${a.id}-${a.body}`}
                defaultValue={a.body}
                onBlur={(e) => {
                  if (e.target.value !== a.body) updateA.mutate({ id: a.id, body: { body: e.target.value } });
                }}
              />
              <button onClick={() => delA.mutate(a.id)}>x</button>
            </div>
          ))}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newAnswer.trim()) return;
              await addA.mutateAsync({ questionId: q.id, body: { body: newAnswer, isCorrect: false } });
              setNewAnswer("");
            }}
          >
            <input placeholder="Novi odgovor" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
            <button>Dodaj</button>
          </form>
        </div>
      )}
    </div>
  );
}

export function EditQuiz() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuizDetail(quizId);
  const addQ = useAddQuestion(quizId);
  const [newType, setNewType] = useState("single");

  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;

  return (
    <div>
      <Link to={data.moduleIds?.length ? `/admin/modules/${data.moduleIds[0]}` : "/admin/modules"}>Nazad</Link>
      <h1>Uredi kviz: {data.name}</h1>
      <QuizMetaForm key={quizId} quizId={quizId} quiz={data} />
      <h2>Pitanja ({data.questions.length})</h2>
      <div>
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="single">Jedan odgovor</option>
          <option value="multiple">Vise odgovora</option>
          <option value="text">Tekst</option>
        </select>
        <button
          onClick={() => addQ.mutate({ bodyHtml: "<p>Novo pitanje</p>", type: newType })}
        >
          Dodaj pitanje
        </button>
      </div>
      {data.questions.map((q: any) => (
        <QuestionCard key={q.id} quizId={quizId} q={q} />
      ))}
    </div>
  );
}
