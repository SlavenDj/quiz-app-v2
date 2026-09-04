import { prisma } from "../lib/prisma.js";
import { httpError, imageUrl } from "./common.js";
import { removeUploadedFile } from "./uploads.js";

const QUESTION_TYPES = ["single", "multiple", "text"];

export async function searchBank(q?: string, type?: string) {
  if (type && !QUESTION_TYPES.includes(type)) throw httpError(400, "Neispravan tip pitanja.");
  const questions = await prisma.question.findMany({
    where: {
      ...(q ? { bodyHtml: { contains: q } } : {}),
      ...(type ? { type } : {}),
    },
    select: { id: true, bodyHtml: true, type: true, _count: { select: { quizzes: true } } },
    take: 50,
    orderBy: { id: "desc" },
  });
  return questions.map((x) => ({ id: x.id, bodyHtml: x.bodyHtml, type: x.type, quizCount: x._count.quizzes }));
}

export async function attachQuestion(quizId: number, questionId: number) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw httpError(404, "Pitanje nije pronadjeno.");
  const existing = await prisma.quizQuestion.findUnique({
    where: { quizId_questionId: { quizId, questionId } },
  });
  if (existing) throw httpError(409, "Pitanje je vec dodano u kviz.");
  const agg = await prisma.quizQuestion.aggregate({ where: { quizId }, _max: { sortOrder: true } });
  return prisma.quizQuestion.create({
    data: { quizId, questionId, sortOrder: (agg._max.sortOrder ?? -1) + 1 },
  });
}

export async function detachQuestion(quizId: number, questionId: number) {
  const existing = await prisma.quizQuestion.findUnique({
    where: { quizId_questionId: { quizId, questionId } },
  });
  if (!existing) throw httpError(404, "Pitanje nije pronadjeno.");
  await prisma.quizQuestion.delete({ where: { quizId_questionId: { quizId, questionId } } });
  return { ok: true };
}

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
  removeUploadedFile(q.imageFile);
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { questionId } }),
    prisma.quizQuestion.deleteMany({ where: { questionId } }),
    prisma.question.delete({ where: { id: questionId } }),
  ]);
  return { ok: true };
}

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

export async function setQuestionImage(questionId: number, filename: string) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  removeUploadedFile(q.imageFile);
  const updated = await prisma.question.update({ where: { id: questionId }, data: { imageFile: filename } });
  return { imageUrl: imageUrl(updated.imageFile) };
}

export async function deleteQuestionImage(questionId: number) {
  const q = await prisma.question.findUnique({ where: { id: questionId } });
  if (!q) throw httpError(404, "Pitanje nije pronadjeno.");
  removeUploadedFile(q.imageFile);
  await prisma.question.update({ where: { id: questionId }, data: { imageFile: null } });
  return { ok: true };
}
