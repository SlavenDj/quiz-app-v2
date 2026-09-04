import { useState } from "react";
import { useUpdateQuiz } from "./api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { TextInput } from "../../components/ui/TextInput";

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
        <Input
          id="quiz-timeLimit"
          label="Limit (s)"
          type="number"
          value={meta.timeLimitSec}
          onChange={(e) => setMeta({ ...meta, timeLimitSec: Number(e.target.value) })}
          min={60}
        />
        <Input
          id="quiz-attempts"
          label="Pokušaji"
          type="number"
          value={meta.maxAttempts}
          onChange={(e) => setMeta({ ...meta, maxAttempts: Number(e.target.value) })}
          min={1}
          max={10}
        />
        <div className="sm:col-span-2">
          <Button type="submit" loading={updateQuiz.isPending}>
            Spasi
          </Button>
        </div>
      </form>
    </Card>
  );
}
