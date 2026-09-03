import type { PlayQuestion } from "./api";

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
    <div>
      {q.answers.map((a) => (
        <label key={a.id}>
          <input
            type="radio"
            name={`q-${q.questionId}`}
            checked={value.answerIds[0] === a.id}
            onChange={() => onChange({ ...value, answerIds: [a.id] })}
          />
          {a.body}
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
    <div>
      {q.answers.map((a) => (
        <label key={a.id}>
          <input type="checkbox" checked={value.answerIds.includes(a.id)} onChange={() => toggle(a.id)} />
          {a.body}
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
    <textarea
      rows={4}
      placeholder="Unesite odgovor"
      value={value.text}
      onChange={(e) => onChange({ ...value, text: e.target.value })}
    />
  );
}
