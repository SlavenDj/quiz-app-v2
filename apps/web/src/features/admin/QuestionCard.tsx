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
import { Checkbox } from "../../components/ui/Checkbox";
import { Input } from "../../components/ui/Input";
import { Radio } from "../../components/ui/Radio";
import { Select } from "../../components/ui/Select";
import { TextInput } from "../../components/ui/TextInput";

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
        <Select
          aria-label="Tip pitanja"
          className="w-auto"
          value={q.type}
          onChange={(e) => updateQ.mutate({ id: q.id, body: { type: e.target.value } })}
        >
          <option value="single">Jedan odgovor</option>
          <option value="multiple">Vise odgovora</option>
          <option value="text">Tekst</option>
        </Select>
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
        <Input
          key={`${q.id}-${q.expectedText ?? ""}`}
          placeholder="Ocekivani odgovor (tacan tekst)"
          aria-label="Očekivani odgovor"
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
            className="min-w-0 max-w-full text-sm text-gray-700 file:mr-3 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-100 dark:text-zinc-300 dark:file:border-zinc-700 dark:file:bg-zinc-800 dark:file:text-zinc-200"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Slika pitanja"
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
                <Radio
                  size="sm"
                  name={`correct-${q.id}`}
                  checked={a.isCorrect}
                  aria-label="Tačan odgovor"
                  onChange={() => updateA.mutate({ id: a.id, body: { isCorrect: true } })}
                />
              ) : (
                <Checkbox
                  size="sm"
                  checked={a.isCorrect}
                  aria-label="Tačan odgovor"
                  onChange={(e) => updateA.mutate({ id: a.id, body: { isCorrect: e.target.checked } })}
                />
              )}
              <Input
                key={`${a.id}-${a.body}`}
                className="min-w-0 flex-1"
                aria-label="Tekst odgovora"
                defaultValue={a.body}
                onBlur={(e) => {
                  if (e.target.value !== a.body) updateA.mutate({ id: a.id, body: { body: e.target.value } });
                }}
              />
              <Button
                variant="danger"
                size="sm"
                className="shrink-0"
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
