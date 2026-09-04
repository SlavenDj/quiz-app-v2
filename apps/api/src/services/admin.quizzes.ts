import { prisma } from "../lib/prisma.js";
import { httpError, imageUrl } from "./common.js";
import { UPLOAD_DIR, removeUploadedFile } from "./uploads.js";

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

/** Full removal of a quiz: attempts, links, orphan questions (+answers+images).
 *  Questions shared with other quizzes keep their answers — only the link is cut. */
export async function deleteQuizCascade(quizId: number) {
  const links = await prisma.quizQuestion.findMany({ where: { quizId }, select: { questionId: true } });
  const questionIds = links.map((l) => l.questionId);
  const shared = new Set(
    (
      await prisma.quizQuestion.findMany({
        where: { questionId: { in: questionIds }, quizId: { not: quizId } },
        select: { questionId: true },
      })
    ).map((l) => l.questionId)
  );
  const orphanIds = questionIds.filter((id) => !shared.has(id));
  const orphans = await prisma.question.findMany({ where: { id: { in: orphanIds } }, select: { imageFile: true } });
  for (const o of orphans) removeUploadedFile(o.imageFile);
  await prisma.attempt.deleteMany({ where: { quizId } });
  await prisma.quizQuestion.deleteMany({ where: { quizId } });
  await prisma.quizModule.deleteMany({ where: { quizId } });
  await prisma.answer.deleteMany({ where: { questionId: { in: orphanIds } } });
  await prisma.question.deleteMany({ where: { id: { in: orphanIds } } });
  await prisma.quiz.delete({ where: { id: quizId } });
}

export async function deleteQuiz(quizId: number) {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  await deleteQuizCascade(quizId);
  return { ok: true };
}

export { UPLOAD_DIR };
