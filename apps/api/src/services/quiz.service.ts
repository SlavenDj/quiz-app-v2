import { prisma } from "../lib/prisma.js";

const GRACE_SEC = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeText(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function imageUrl(file: string | null) {
  if (!file) return null;
  return `${process.env.API_PUBLIC_URL ?? "http://localhost:3000"}/uploads/${file}`;
}

/** Academic year Sept–June, e.g. "2025/26" */
export function currentEditionLabel(now = new Date()) {
  const y = now.getFullYear();
  const start = now.getMonth() >= 8 ? y : y - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
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
    quizzes: mod.quizzes.map(({ quiz }) => {
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

export async function getQuizMeta(quizId: number, userId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      _count: { select: { questions: true } },
      attempts: { where: { userId }, orderBy: { attemptNo: "desc" } },
      modules: { include: { module: true } },
    },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  const done = quiz.attempts.filter((a) => a.submittedAt);
  return {
    id: quiz.id,
    name: quiz.name,
    description: quiz.description,
    introHtml: quiz.introHtml,
    timeLimitSec: quiz.timeLimitSec,
    maxAttempts: quiz.maxAttempts,
    passPct: quiz.passPct,
    questionCount: quiz._count.questions,
    moduleId: quiz.modules[0]?.moduleId ?? null,
    myAttempts: done.length,
    canAttempt: done.length < quiz.maxAttempts,
  };
}

interface PlayEntry {
  questionId: number;
  answerIds: number[];
}

export async function startOrResumePlay(quizId: number, userId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { question: { include: { answers: true } } },
      },
    },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");
  if (quiz.questions.length === 0) throw httpError(400, "Kviz nema pitanja.");

  // Reuse open attempt if still within time
  const open = await prisma.attempt.findFirst({
    where: { quizId, userId, submittedAt: null },
    orderBy: { attemptNo: "desc" },
  });
  if (open) {
    const elapsed = (Date.now() - open.startedAt.getTime()) / 1000;
    if (elapsed <= quiz.timeLimitSec + GRACE_SEC) {
      return playPayload(quiz, open.id, open.attemptNo, open.startedAt, JSON.parse(open.playOrder) as PlayEntry[]);
    }
    // Expired → auto-close with 0 and fall through to new attempt
    await prisma.attempt.update({
      where: { id: open.id },
      data: {
        submittedAt: new Date(),
        score: 0,
        durationSec: quiz.timeLimitSec,
        answersJson: "[]",
      },
    });
  }

  const completed = await prisma.attempt.count({ where: { quizId, userId, submittedAt: { not: null } } });
  if (completed >= quiz.maxAttempts) throw httpError(403, "Iskoristili ste sve pokusaje.");

  const order: PlayEntry[] = shuffle(
    quiz.questions.map(({ question }) => ({
      questionId: question.id,
      answerIds: shuffle(question.answers.map((a) => a.id)),
    }))
  );
  const attempt = await prisma.attempt.create({
    data: {
      userId,
      quizId,
      attemptNo: completed + 1,
      maxScore: quiz.questions.length,
      playOrder: JSON.stringify(order),
    },
  });
  return playPayload(quiz, attempt.id, attempt.attemptNo, attempt.startedAt, order);
}

function playPayload(
  quiz: {
    id: number;
    name: string;
    timeLimitSec: number;
    questions: { question: { id: number; bodyHtml: string; type: string; imageFile: string | null; answers: { id: number; body: string }[] } }[];
  },
  attemptId: number,
  attemptNo: number,
  startedAt: Date,
  order: PlayEntry[]
) {
  const byId = new Map(quiz.questions.map((q) => [q.question.id, q.question]));
  const timeLeftSec = Math.max(
    0,
    quiz.timeLimitSec - Math.floor((Date.now() - startedAt.getTime()) / 1000)
  );
  return {
    attemptId,
    attemptNo,
    quizId: quiz.id,
    quizName: quiz.name,
    timeLimitSec: quiz.timeLimitSec,
    startedAt,
    timeLeftSec,
    questions: order.map((entry) => {
      const q = byId.get(entry.questionId)!;
      const ansById = new Map(q.answers.map((a) => [a.id, a]));
      return {
        questionId: q.id,
        type: q.type,
        bodyHtml: q.bodyHtml,
        imageUrl: imageUrl(q.imageFile),
        answers: entry.answerIds.map((id) => ({ id, body: ansById.get(id)!.body })),
      };
    }),
  };
}

export async function submitAttempt(
  quizId: number,
  userId: number,
  attemptId: number,
  answers: { questionId: number; answerIds?: number[]; text?: string }[]
) {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.quizId !== quizId || attempt.userId !== userId) {
    throw httpError(404, "Pokusaj nije pronadjen.");
  }
  if (attempt.submittedAt) throw httpError(400, "Kviz je vec predat.");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { question: { include: { answers: true } } } } },
  });
  if (!quiz) throw httpError(404, "Kviz nije pronadjen.");

  const byQuestion = new Map(answers.map((a) => [a.questionId, a]));
  let score = 0;
  const review: { questionId: number; correct: boolean }[] = [];

  for (const { question } of quiz.questions) {
    const given = byQuestion.get(question.id);
    let correct = false;
    if (given) {
      if (question.type === "single") {
        const correctAns = question.answers.find((a) => a.isCorrect);
        correct = (given.answerIds?.length ?? 0) === 1 && given.answerIds![0] === correctAns?.id;
      } else if (question.type === "multiple") {
        const right = new Set(question.answers.filter((a) => a.isCorrect).map((a) => a.id));
        const picked = new Set(given.answerIds ?? []);
        correct = right.size === picked.size && [...right].every((id) => picked.has(id));
      } else if (question.type === "text") {
        correct =
          !!question.expectedText &&
          normalizeText(given.text ?? "") === normalizeText(question.expectedText);
      }
    }
    if (correct) score++;
    review.push({ questionId: question.id, correct });
  }

  const submittedAt = new Date();
  const durationSec = Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);
  await prisma.attempt.update({
    where: { id: attempt.id },
    data: { submittedAt, score, durationSec, answersJson: JSON.stringify(answers) },
  });

  return {
    attemptId: attempt.id,
    score,
    maxScore: quiz.questions.length,
    durationSec,
    passed: score / quiz.questions.length >= quiz.passPct / 100,
    review,
  };
}

export async function getAttemptReview(attemptId: number, userId: number) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { include: { questions: { orderBy: { sortOrder: "asc" }, include: { question: { include: { answers: true } } } } } },
      user: true,
    },
  });
  if (!attempt || !attempt.submittedAt) throw httpError(404, "Rezultat nije pronadjen.");
  if (attempt.userId !== userId && attempt.quiz && (await isNotAdmin(userId))) {
    throw httpError(403, "Forbidden");
  }
  const given = new Map(
    (JSON.parse(attempt.answersJson) as { questionId: number; answerIds?: number[]; text?: string }[]).map((a) => [
      a.questionId,
      a,
    ])
  );
  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    quizName: attempt.quiz.name,
    score: attempt.score,
    maxScore: attempt.maxScore,
    durationSec: attempt.durationSec,
    review: attempt.quiz.questions.map(({ question }) => ({
      questionId: question.id,
      type: question.type,
      bodyHtml: question.bodyHtml,
      imageUrl: imageUrl(question.imageFile),
      answers: question.answers.map((a) => ({ id: a.id, body: a.body, isCorrect: a.isCorrect })),
      userAnswerIds: given.get(question.id)?.answerIds ?? [],
      userText: given.get(question.id)?.text ?? null,
    })),
  };
}

async function isNotAdmin(userId: number) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  return u?.role !== "admin";
}

export async function getLeaderboard(limit = 50) {
  const firsts = await prisma.attempt.findMany({
    where: { attemptNo: 1, submittedAt: { not: null } },
    include: { user: true },
  });
  const agg = new Map<
    number,
    { userId: number; firstName: string; lastName: string; avatarFile: string | null; totalScore: number; totalDurationSec: number; quizzesPlayed: number }
  >();
  for (const a of firsts) {
    const cur = agg.get(a.userId) ?? {
      userId: a.userId,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      avatarFile: a.user.avatarFile,
      totalScore: 0,
      totalDurationSec: 0,
      quizzesPlayed: 0,
    };
    cur.totalScore += a.score;
    cur.totalDurationSec += a.durationSec ?? 0;
    cur.quizzesPlayed += 1;
    agg.set(a.userId, cur);
  }
  return [...agg.values()]
    .sort((x, y) => y.totalScore - x.totalScore || x.totalDurationSec - y.totalDurationSec)
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, ...r }));
}
