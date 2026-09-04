import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}

function imageUrl(file: string | null) {
  if (!file) return null;
  return `${process.env.API_PUBLIC_URL ?? "http://localhost:3000"}/uploads/${file}`;
}

// ---------- Modules ----------

export async function listModulesAdmin() {
  const { refreshModuleStatuses } = await import("./quiz.service.js");
  await refreshModuleStatuses();
  const modules = await prisma.module.findMany({
    include: { _count: { select: { quizzes: true } } },
    orderBy: { moduleNumber: "asc" },
  });
  return modules.map((m) => ({ ...m, totalQuizzes: m._count.quizzes }));
}

export async function createModule(data: {
  name: string;
  shortDesc: string;
  longDesc: string;
  editionLabel: string;
  moduleNumber: number;
  startAt: string;
  endAt: string;
}) {
  return prisma.module.create({
    data: {
      ...data,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      status: "Locked",
    },
  });
}

export async function updateModule(
  id: number,
  data: Partial<{ name: string; shortDesc: string; longDesc: string; editionLabel: string; moduleNumber: number; startAt: string; endAt: string; status: string }>
) {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  if (data.status && !["Locked", "InProgress", "Finished"].includes(data.status)) {
    throw httpError(400, "Neispravan status.");
  }
  return prisma.module.update({
    where: { id },
    data: {
      ...data,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
    },
  });
}

export async function deleteModule(id: number) {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  await prisma.$transaction([
    prisma.quizModule.deleteMany({ where: { moduleId: id } }),
    prisma.module.delete({ where: { id } }),
  ]);
  return { ok: true };
}

// ---------- Quizzes ----------

export async function getQuizDetail(quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      modules: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { question: { include: { answers: { orderBy: { id: "asc" } } } } },
      },
    },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  return {
    ...quiz,
    moduleIds: quiz.modules.map((m) => m.moduleId),
    questions: quiz.questions.map(({ question, sortOrder }) => ({
      id: question.id,
      bodyHtml: question.bodyHtml,
      type: question.type,
      expectedText: question.expectedText,
      imageFile: question.imageFile,
      imageUrl: imageUrl(question.imageFile),
      sortOrder,
      answers: question.answers,
    })),
  };
}

export async function createQuiz(
  moduleId: number,
  data: { name: string; description: string; introHtml?: string; timeLimitSec?: number; maxAttempts?: number; passPct?: number }
) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  const quiz = await prisma.quiz.create({
    data: {
      name: data.name,
      description: data.description ?? "",
      introHtml: data.introHtml ?? "",
      timeLimitSec: data.timeLimitSec ?? 600,
      maxAttempts: data.maxAttempts ?? 3,
      passPct: data.passPct ?? 50,
      modules: { create: { moduleId } },
    },
  });
  return quiz;
}

export async function updateQuiz(
  quizId: number,
  data: Partial<{ name: string; description: string; introHtml: string; timeLimitSec: number; maxAttempts: number; passPct: number }>
) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  return prisma.quiz.update({ where: { id: quizId }, data });
}

export async function deleteQuiz(quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { question: true } } },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  const questionIds = quiz.questions.map((q) => q.questionId);
  await prisma.$transaction([
    prisma.attempt.deleteMany({ where: { quizId } }),
    prisma.quizQuestion.deleteMany({ where: { quizId } }),
    prisma.quizModule.deleteMany({ where: { quizId } }),
    prisma.quiz.delete({ where: { id: quizId } }),
    // delete orphan questions (not linked to any other quiz) + their answers
    prisma.answer.deleteMany({ where: { questionId: { in: questionIds } } }),
    prisma.question.deleteMany({
      where: { id: { in: questionIds }, quizzes: { none: {} } },
    }),
  ]);
  return { ok: true };
}

// ---------- Questions ----------

const QUESTION_TYPES = ["single", "multiple", "text"];

export async function addQuestion(
  quizId: number,
  data: { bodyHtml: string; type: string; expectedText?: string }
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { _count: { select: { questions: true } } },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  if (!QUESTION_TYPES.includes(data.type)) throw httpError(400, "Neispravan tip pitanja.");
  const question = await prisma.question.create({
    data: {
      bodyHtml: data.bodyHtml,
      type: data.type,
      expectedText: data.expectedText ?? null,
      quizzes: { create: { quizId, sortOrder: quiz._count.questions } },
    },
  });
  return question;
}

export async function updateQuestion(
  questionId: number,
  data: Partial<{ bodyHtml: string; type: string; expectedText: string | null }>
) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  if (data.type && !QUESTION_TYPES.includes(data.type)) throw httpError(400, "Neispravan tip pitanja.");
  return prisma.question.update({ where: { id: questionId }, data });
}

export async function deleteQuestion(questionId: number) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  if (q.imageFile) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, q.imageFile));
    } catch {}
  }
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { questionId } }),
    prisma.quizQuestion.deleteMany({ where: { questionId } }),
    prisma.question.delete({ where: { id: questionId } }),
  ]);
  return { ok: true };
}

// ---------- Answers ----------

export async function addAnswer(questionId: number, data: { body: string; isCorrect?: boolean }) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  if (!data.body?.trim()) throw httpError(400, "Odgovor ne moze biti prazan.");
  if (q.type === "single" && data.isCorrect) {
    // single choice: only one correct — reset others
    await prisma.answer.updateMany({ where: { questionId }, data: { isCorrect: false } });
  }
  return prisma.answer.create({
    data: { questionId, body: data.body.trim(), isCorrect: data.isCorrect ?? false },
  });
}

export async function updateAnswer(
  answerId: number,
  data: Partial<{ body: string; isCorrect: boolean }>
) {
  const a = await prisma.answer.findUnique({ where: { id: answerId }, include: { question: true } });
  if (!a) throw httpError(404, "Odgovor nije pronadjen.");
  if (data.body !== undefined && !data.body.trim()) throw httpError(400, "Odgovor ne moze biti prazan.");
  if (a.question.type === "single" && data.isCorrect) {
    await prisma.answer.updateMany({ where: { questionId: a.questionId }, data: { isCorrect: false } });
  }
  return prisma.answer.update({
    where: { id: answerId },
    data: {
      body: data.body !== undefined ? data.body.trim() : undefined,
      isCorrect: data.isCorrect,
    },
  });
}

export async function deleteAnswer(answerId: number) {
  const a = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!a) throw httpError(404, "Odgovor nije pronadjen.");
  await prisma.answer.delete({ where: { id: answerId } });
  return { ok: true };
}

// ---------- Question image ----------

export async function setQuestionImage(questionId: number, filename: string) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  if (q.imageFile) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, q.imageFile));
    } catch {}
  }
  const updated = await prisma.question.update({ where: { id: questionId }, data: { imageFile: filename } });
  return { imageUrl: imageUrl(updated.imageFile) };
}

export async function deleteQuestionImage(questionId: number) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  if (q.imageFile) {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, q.imageFile));
    } catch {}
  }
  await prisma.question.update({ where: { id: questionId }, data: { imageFile: null } });
  return { ok: true };
}
