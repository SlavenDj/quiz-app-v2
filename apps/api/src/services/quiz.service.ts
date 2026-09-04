import { prisma } from "../lib/prisma.js";
import { GRACE_SEC, httpError, imageUrl, normalizeText, shuffle } from "./common.js";

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

  // Time-gating: quiz is playable only if at least one linked module is
  // currently InProgress (or the quiz has no module links at all).
  const linkedModuleIds = await prisma.quizModule.findMany({ where: { quizId }, select: { moduleId: true } });
  if (linkedModuleIds.length > 0) {
    const open = await prisma.module.count({
      where: { id: { in: linkedModuleIds.map((m) => m.moduleId) }, status: "InProgress" },
    });
    if (open === 0) throw httpError(403, "Kviz trenutno nije dostupan.");
  }

  // Close any stale open attempts for this user+quiz first (keeps exactly
  // one open attempt; orphans can never accumulate or bypass maxAttempts).
  const opens = await prisma.attempt.findMany({
    where: { quizId, userId, submittedAt: null },
    orderBy: { attemptNo: "desc" },
  });
  const completed = await prisma.attempt.count({ where: { quizId, userId, submittedAt: { not: null } } });
  for (const o of opens) {
    const elapsed = (Date.now() - o.startedAt.getTime()) / 1000;
    if (elapsed > quiz.timeLimitSec + GRACE_SEC) {
      await prisma.attempt.update({
        where: { id: o.id },
        data: { submittedAt: new Date(), score: 0, durationSec: quiz.timeLimitSec, answersJson: "[]" },
      });
    }
  }
  const live = await prisma.attempt.findFirst({
    where: { quizId, userId, submittedAt: null },
    orderBy: { attemptNo: "desc" },
  });
  if (live) {
    if (completed >= quiz.maxAttempts) throw httpError(403, "Iskoristili ste sve pokusaje.");
    return { ...playPayload(quiz, live.id, live.attemptNo, live.startedAt, JSON.parse(live.playOrder) as PlayEntry[]), resumed: true };
  }

  if (completed >= quiz.maxAttempts) throw httpError(403, "Iskoristili ste sve pokusaje.");

  const order: PlayEntry[] = shuffle(
    quiz.questions.map(({ question }) => ({
      questionId: question.id,
      answerIds: shuffle(question.answers.map((a) => a.id)),
    }))
  );
  // Non-atomic count→create can collide on attemptNo under concurrent
  // double-POST /play; retry on unique violation instead of 500.
  for (let attempt = 0; attempt < 3; attempt++) {
    const n = await prisma.attempt.count({ where: { quizId, userId, submittedAt: { not: null } } });
    try {
      const created = await prisma.attempt.create({
        data: {
          userId,
          quizId,
          attemptNo: n + 1,
          maxScore: quiz.questions.length,
          playOrder: JSON.stringify(order),
        },
      });
      return { ...playPayload(quiz, created.id, created.attemptNo, created.startedAt, order), resumed: false };
    } catch (e: any) {
      if (e?.code !== "P2002" || attempt === 2) throw e;
    }
  }
  throw httpError(500, "Neuspjesno pokretanje kviza.");
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
  // Includes the submit grace window so the display matches resume policy.
  const timeLeftSec = Math.max(
    0,
    quiz.timeLimitSec + GRACE_SEC - Math.floor((Date.now() - startedAt.getTime()) / 1000)
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

  // Reject unknown questionIds instead of silently ignoring them.
  const known = new Set(quiz.questions.map((q) => q.question.id));
  for (const a of answers) {
    if (!known.has(a.questionId)) throw httpError(400, "Nepoznato pitanje u odgovorima.");
  }

  // Late submit: auto-close with 0 (same as the /play expiry path).
  const elapsedSec = (Date.now() - attempt.startedAt.getTime()) / 1000;
  const submittedAt = new Date();
  if (elapsedSec > quiz.timeLimitSec + GRACE_SEC) {
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { submittedAt, score: 0, durationSec: quiz.timeLimitSec, answersJson: JSON.stringify(answers) },
    });
    return { attemptId: attempt.id, score: 0, maxScore: quiz.questions.length, durationSec: quiz.timeLimitSec, passed: false, expired: true, review: [] };
  }

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
        // Non-empty exact set match (zero-correct + empty pick is NOT a point).
        correct = picked.size > 0 && right.size === picked.size && [...right].every((id) => picked.has(id));
      } else if (question.type === "text") {
        correct =
          !!question.expectedText &&
          normalizeText(given.text ?? "") === normalizeText(question.expectedText);
      }
    }
    if (correct) score++;
    review.push({ questionId: question.id, correct });
  }

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
  if (attempt.userId !== userId) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u?.role !== "admin") throw httpError(403, "Forbidden");
  }
  let parsed: { questionId: number; answerIds?: number[]; text?: string }[];
  try {
    parsed = JSON.parse(attempt.answersJson);
    if (!Array.isArray(parsed)) throw new Error("bad shape");
  } catch {
    throw httpError(500, "Osteceni podaci pokusaja.");
  }
  const given = new Map(parsed.map((a) => [a.questionId, a]));
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
