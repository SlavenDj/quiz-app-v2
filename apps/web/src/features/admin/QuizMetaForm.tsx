import { useState } from "react";
import { useUpdateQuiz } from "./api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextInput } from "../../components/ui/TextInput";

const inputClassName =
  "w-full rounded border border-brand-muted px-3 py-2 text-sm outline-none focus:border-brand-quiz";

export function QuizMetaForm({ quizId, quiz }: { quizId: number; quiz: any }) {
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
