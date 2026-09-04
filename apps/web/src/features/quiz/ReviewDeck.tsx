import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ReviewEmptyArt } from "./ReviewEmptyArt";

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
  if (error) return <p className="page-container text-status-danger dark:text-red-400">Greska: {(error as Error).message}</p>;
  const deck = Array.isArray(data) ? data : [];
  if (deck.length === 0)
    return (
      <div className="page-container">
        <div className="mx-auto max-w-md rounded-2xl border border-brand-muted/40 bg-white dark:bg-zinc-900 p-8 text-center shadow-card sm:p-10">
          <ReviewEmptyArt className="mx-auto h-48 w-auto" />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-quiz dark:text-fuchsia-300">
            Ponavljanje · sve čisto
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100">
            Nemaš ništa za ponavljanje
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Nemate pogrešnih odgovora za ponavljanje. Bravo — tako nastavite!
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to="/home"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-brand-nav px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-quiz"
            >
              Igraj kviz
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-brand-quiz/40 px-5 py-2.5 text-sm font-semibold text-brand-quiz dark:text-fuchsia-300 transition-colors hover:bg-brand-muted/20"
            >
              Rang lista
            </Link>
          </div>
        </div>
      </div>
    );
  const item = deck[Math.min(idx, deck.length - 1)];
  const go = (d: number) => {
    setIdx((i) => Math.min(Math.max(i + d, 0), deck.length - 1));
    setRevealed(false);
  };
  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-zinc-100">
        Ponavljanje ({Math.min(idx + 1, deck.length)}/{deck.length})
      </h1>
      <Card className="mx-auto w-full max-w-2xl rounded-card shadow-card">
        <p className="text-sm text-gray-500 dark:text-zinc-400">{item.quizName}</p>
        <div className="mt-2 break-words text-base text-gray-900 dark:text-zinc-100" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
        {item.type === "text" ? (
          revealed && <p className="mt-3 rounded bg-green-50 dark:bg-green-950 px-3 py-2 text-sm font-medium text-green-800">{item.expectedText}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {item.answers.map((a) => (
              <li
                key={a.id}
                className={`rounded border px-3 py-2 text-sm ${
                  revealed && a.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950 font-semibold text-green-800" : " border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200"
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
