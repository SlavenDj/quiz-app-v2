import { prisma } from "../lib/prisma.js";
import { httpError } from "./common.js";

/** Academic year Sept–June, e.g. "2025/26" */
export function currentEditionLabel(now = new Date()) {
  const y = now.getFullYear();
  const start = now.getMonth() >= 8 ? y : y - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

/** Lazy status rollover (replaces the old cron): runs on every module read,
 *  portable across SQLite/MySQL (JS dates, no DB date functions). Never regresses. */
export async function refreshModuleStatuses(now = new Date()) {
  await prisma.module.updateMany({
    where: { status: "Locked", startAt: { lte: now } },
    data: { status: "InProgress" },
  });
  await prisma.module.updateMany({
    where: { status: "InProgress", endAt: { lte: now } },
    data: { status: "Finished" },
  });
}

export async function getEditions() {
  const rows = await prisma.module.findMany({
    select: { editionLabel: true },
    distinct: ["editionLabel"],
    orderBy: { editionLabel: "desc" },
  });
  return rows.map((r) => r.editionLabel);
}

export async function listModules(edition?: string) {
  await refreshModuleStatuses();
  const modules = await prisma.module.findMany({
    where: edition ? { editionLabel: edition } : undefined,
    include: { _count: { select: { quizzes: true } } },
    orderBy: { moduleNumber: "asc" },
  });
  return modules.map((m) => ({
    id: m.id,
    name: m.name,
    shortDesc: m.shortDesc,
    longDesc: m.longDesc,
    editionLabel: m.editionLabel,
    moduleNumber: m.moduleNumber,
    startAt: m.startAt,
    endAt: m.endAt,
    status: m.status,
    totalQuizzes: m._count.quizzes,
  }));
}

export async function getModuleDetail(moduleId: number, userId: number) {
  await refreshModuleStatuses();
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      quizzes: {
        include: {
          quiz: {
            include: {
              _count: { select: { questions: true } },
              attempts: { where: { userId }, orderBy: { attemptNo: "desc" } },
            },
          },
        },
      },
    },
  });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  return {
    id: mod.id,
    name: mod.name,
    shortDesc: mod.shortDesc,
    longDesc: mod.longDesc,
    editionLabel: mod.editionLabel,
    moduleNumber: mod.moduleNumber,
    startAt: mod.startAt,
    endAt: mod.endAt,
    status: mod.status,
    quizzes: mod.quizzes
      .filter(({ quiz }) => quiz.status === "published")
      .map(({ quiz }) => {
      const done = quiz.attempts.filter((a) => a.submittedAt);
      return {
        quizId: quiz.id,
        quizName: quiz.name,
        description: quiz.description,
        timeLimitSec: quiz.timeLimitSec,
        maxAttempts: quiz.maxAttempts,
        questionCount: quiz._count.questions,
        myAttempts: done.length,
        canAttempt: done.length < quiz.maxAttempts,
        lastScore: done[0]?.score ?? null,
      };
    }),
  };
}
