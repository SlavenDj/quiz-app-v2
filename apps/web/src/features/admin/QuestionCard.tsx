import { useState } from "react";
import {
  useAddAnswer,
  useDeleteAnswer,
  useDeleteQuestion,
  useDeleteQuestionImage,
  useUpdateAnswer,
  useUpdateQuestion,
  useUploadQuestionImage,
} from "./api";
import { useDebouncedSave } from "./useDebouncedSave";
import { RichEditor } from "./RichEditor";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextInput } from "../../components/ui/TextInput";

const inputClassName =
  "w-full rounded border border-brand-muted px-3 py-2 text-sm outline-none focus:border-brand-quiz";
const selectClassName =
  "rounded border border-brand-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-quiz";

export function QuestionCard({ quizId, q }: { quizId: number; q: any }) {
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
