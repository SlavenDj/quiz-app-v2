import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";

interface DeckItem {
  quizId: number;
  quizName: string;
  questionId: number;
  type: string;
  bodyHtml: string;
  answers: { id: number; body: string; isCorrect: boolean }[];
  expectedText: string | null;
}

export function ReviewDeck() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["review-deck"],
    queryFn: () => api("/api/review-deck") as Promise<DeckItem[]>,
  });
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  const deck = Array.isArray(data) ? data : [];
  if (deck.length === 0)
    return (
      <div className="page-container">
        <h1 className="text-2xl font-bold text-gray-900">Ponavljanje</h1>
        <p className="mt-2 text-gray-500">Nemate pogrešnih odgovora za ponavljanje. Bravo!</p>
      </div>
    );
  const item = deck[Math.min(idx, deck.length - 1)];
  const go = (d: number) => {
    setIdx((i) => Math.min(Math.max(i + d, 0), deck.length - 1));
    setRevealed(false);
  };
  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">
        Ponavljanje ({Math.min(idx + 1, deck.length)}/{deck.length})
      </h1>
      <Card className="mx-auto w-full max-w-2xl rounded-card shadow-card">
        <p className="text-sm text-gray-500">{item.quizName}</p>
        <div className="mt-2 break-words text-base text-gray-900" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
        {item.type === "text" ? (
          revealed && <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm font-medium text-green-800">{item.expectedText}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {item.answers.map((a) => (
              <li
                key={a.id}
                className={`rounded border px-3 py-2 text-sm ${
                  revealed && a.isCorrect ? "border-green-500 bg-green-50 font-semibold text-green-800" : "border-gray-200 text-gray-800"
                }`}
              >
                {a.body}
              </li>
            ))}
          </ul>
        )}
        {!revealed ? (
          <Button variant="primary" onClick={() => setRevealed(true)} className="mt-4">
            Prikaži odgovor
          </Button>
        ) : (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => go(-1)} disabled={idx === 0}>
              ← Prethodno
            </Button>
            <Button variant="outline" onClick={() => go(1)} disabled={idx >= deck.length - 1}>
              Sljedeće →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
