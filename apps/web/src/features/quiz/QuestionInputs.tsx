import type { PlayQuestion } from "./api";
import { Checkbox } from "../../components/ui/Checkbox";
import { Radio } from "../../components/ui/Radio";
import { Textarea } from "../../components/ui/Textarea";

interface AnswerState {
  answerIds: number[];
  text: string;
}

export function SingleInput({
  q,
  value,
  onChange,
}: {
  q: PlayQuestion;
  value: AnswerState;
  onChange: (v: AnswerState) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {q.answers.map((a) => (
        <label
          key={a.id}
          className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-card border border-brand-muted/60 bg-white dark:bg-zinc-900 px-3 py-2 text-base text-gray-900 dark:text-zinc-100 transition-colors hover:border-brand-quiz"
        >
          <input
            type="radio"
            name={`q-${q.questionId}`}
            checked={value.answerIds[0] === a.id}
            onChange={() => onChange({ ...value, answerIds: [a.id] })}
            className="h-5 w-5 shrink-0 accent-brand-quiz"
          />
          <span className="min-w-0 break-words">{a.body}</span>
        </label>
      ))}
    </div>
  );
}

export function MultiInput({
  q,
  value,
  onChange,
}: {
  q: PlayQuestion;
  value: AnswerState;
  onChange: (v: AnswerState) => void;
}) {
  const toggle = (id: number) => {
    const has = value.answerIds.includes(id);
    onChange({
      ...value,
      answerIds: has ? value.answerIds.filter((x) => x !== id) : [...value.answerIds, id],
    });
  };
  return (
    <div className="flex flex-col gap-2">
      {q.answers.map((a) => (
        <label
          key={a.id}
          className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-card border border-brand-muted/60 bg-white dark:bg-zinc-900 px-3 py-2 text-base text-gray-900 dark:text-zinc-100 transition-colors hover:border-brand-quiz"
        >
          <input
            type="checkbox"
            checked={value.answerIds.includes(a.id)}
            onChange={() => toggle(a.id)}
            className="h-5 w-5 shrink-0 accent-brand-quiz"
          />
          <span className="min-w-0 break-words">{a.body}</span>
        </label>
      ))}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
}: {
  value: AnswerState;
  onChange: (v: AnswerState) => void;
}) {
  return (
    <Textarea
      rows={4}
      placeholder="Unesite odgovor"
      aria-label="Tekstualni odgovor"
      value={value.text}
      onChange={(e) => onChange({ ...value, text: e.target.value })}
      className="min-h-[44px] text-base"
    />
  );
}
