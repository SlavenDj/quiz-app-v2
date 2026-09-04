import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export interface PlayAnswer {
  id: number;
  body: string;
}

export interface PlayQuestion {
  questionId: number;
  type: string;
  bodyHtml: string;
  imageUrl: string | null;
  answers: PlayAnswer[];
}

export interface PlayPayload {
  attemptId: number;
  attemptNo: number;
  quizId: number;
  quizName: string;
  timeLimitSec: number;
  startedAt: string;
  timeLeftSec: number;
  questions: PlayQuestion[];
}

export interface SubmitResult {
  attemptId: number;
  score: number;
  maxScore: number;
  durationSec: number;
  passed: boolean;
}

export function useEditions() {
  return useQuery({ queryKey: ["editions"], queryFn: () => api("/api/editions") as Promise<string[]> });
}

export function useModules(edition?: string) {
  return useQuery({
    queryKey: ["modules", edition ?? "all"],
    queryFn: () => api(edition ? `/api/modules?edition=${encodeURIComponent(edition)}` : "/api/modules"),
  });
}

export function useModule(id: number) {
  return useQuery({ queryKey: ["module", id], queryFn: () => api(`/api/modules/${id}`) });
}

export function useQuiz(id: number) {
  return useQuery({ queryKey: ["quiz", id], queryFn: () => api(`/api/quizzes/${id}`) });
}

export function useStartPlay() {
  return useMutation({
    mutationFn: (quizId: number) => api(`/api/quizzes/${quizId}/play`, { method: "POST" }) as Promise<PlayPayload>,
  });
}

export function useSubmitQuiz(quizId: number) {
  return useMutation({
    mutationFn: (body: { attemptId: number; answers: { questionId: number; answerIds?: number[]; text?: string }[] }) =>
      api(`/api/quizzes/${quizId}/submit`, { method: "POST", body: JSON.stringify(body) }) as Promise<SubmitResult>,
  });
}

export function useAttempt(id: number) {
  return useQuery({ queryKey: ["attempt", id], queryFn: () => api(`/api/attempts/${id}`) });
}

export function useLeaderboard() {
  return useQuery({ queryKey: ["leaderboard"], queryFn: () => api("/api/leaderboard") });
}
