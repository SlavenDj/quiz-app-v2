import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function useAdminModules() {
  return useQuery({ queryKey: ["admin", "modules"], queryFn: () => api("/api/admin/modules") });
}

export function useCreateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api("/api/admin/modules", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "modules" });
      qc.invalidateQueries({ queryKey: ["editions"] });
    },
  });
}

export function useUpdateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api(`/api/admin/modules/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "modules" });
      qc.invalidateQueries({ queryKey: ["editions"] });
    },
  });
}

export function useDeleteModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api(`/api/admin/modules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "modules" });
      qc.invalidateQueries({ queryKey: ["editions"] });
    },
  });
}

export function useQuizDetail(quizId: number) {
  return useQuery({ queryKey: ["admin", "quiz", quizId], queryFn: () => api(`/api/admin/quizzes/${quizId}`) });
}

export function useAdminModuleQuizzes(moduleId: number) {
  return useQuery({
    queryKey: ["admin", "module-quizzes", moduleId],
    queryFn: () => api(`/api/admin/modules/${moduleId}/quizzes`),
  });
}

export function useCreateQuiz(moduleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      api(`/api/admin/modules/${moduleId}/quizzes`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "modules" });
      qc.invalidateQueries({ queryKey: ["editions"] });
    },
  });
}

export function useUpdateQuiz(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api(`/api/admin/quizzes/${quizId}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] });
      qc.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api(`/api/admin/quizzes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "modules"] });
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "modules" });
      qc.invalidateQueries({ queryKey: ["editions"] });
    },
  });
}

export function useAddQuestion(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      api(`/api/admin/quizzes/${quizId}/questions`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useUpdateQuestion(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api(`/api/admin/questions/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useDeleteQuestion(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api(`/api/admin/questions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useAddAnswer(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: any }) =>
      api(`/api/admin/questions/${questionId}/answers`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useUpdateAnswer(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      api(`/api/admin/answers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useDeleteAnswer(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api(`/api/admin/answers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

async function uploadQuestionImage(questionId: number, file: File) {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/api/admin/questions/${questionId}/image`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "Upload failed");
  return res.json();
}

export function useUploadQuestionImage(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, file }: { questionId: number; file: File }) => uploadQuestionImage(questionId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}

export function useDeleteQuestionImage(quizId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) => api(`/api/admin/questions/${questionId}/image`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] }),
  });
}
