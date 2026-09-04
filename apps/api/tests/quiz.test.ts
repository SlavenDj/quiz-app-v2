import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import app from "../src/app.js";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "quizadmin@gmail.com";
const STUDENT_EMAIL = "quizstudent@gmail.com";
const PASSWORD = "Password123";

let quizId = 0;
let qSingle = 0;
let qMultiple = 0;
let qText = 0;
let aSingleCorrect = 0;
let aSingleWrong = 0;
let aMultiCorrect1 = 0;
let aMultiCorrect2 = 0;
let aMultiWrong = 0;

function assertNoIsCorrectKey(obj: unknown) {
  expect(JSON.stringify(obj)).not.toContain("isCorrect");
}

describe("quiz", () => {
  let adminAgent: ReturnType<typeof request.agent>;
  let studentAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await prisma.attempt.deleteMany({});
    await prisma.quizModule.deleteMany({});
    await prisma.quizQuestion.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.user.deleteMany({
      where: { emailNormalized: { in: [ADMIN_EMAIL, STUDENT_EMAIL] } },
    });

    // Admin created directly in DB (verified), student registered via API
    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        emailNormalized: ADMIN_EMAIL,
        passwordHash,
        firstName: "Quiz",
        lastName: "Admin",
        country: "BiH",
        city: "Sarajevo",
        role: "admin",
        emailVerifiedAt: new Date(),
      },
    });

    adminAgent = request.agent(app);
    const adminLogin = await adminAgent.post("/api/auth/login").send({ email: ADMIN_EMAIL, password: PASSWORD });
    expect(adminLogin.status).toBe(200);

    studentAgent = request.agent(app);
    const reg = await studentAgent.post("/api/auth/register").send({
      firstName: "Quiz",
      lastName: "Student",
      email: STUDENT_EMAIL,
      password: PASSWORD,
      country: "BiH",
      city: "Mostar",
    });
    expect(reg.status).toBe(201);
    await prisma.user.update({
      where: { id: reg.body.userId as number },
      data: { emailVerifiedAt: new Date(), verificationHash: null, verificationExpires: null },
    });
    const studentLogin = await studentAgent.post("/api/auth/login").send({ email: STUDENT_EMAIL, password: PASSWORD });
    expect(studentLogin.status).toBe(200);

    // Seed via API as admin
    const now = new Date();
    const mod = await adminAgent.post("/api/admin/modules").send({
      name: "Test Module",
      shortDesc: "short",
      longDesc: "long",
      editionLabel: "2025/26",
      moduleNumber: 99,
      startAt: new Date(now.getTime() - 86400000).toISOString(),
      endAt: new Date(now.getTime() + 86400000).toISOString(),
    });
    expect(mod.status).toBe(201);

    const quiz = await adminAgent.post(`/api/admin/modules/${mod.body.id}/quizzes`).send({
      name: "Test Quiz",
      description: "desc",
      timeLimitSec: 600,
      maxAttempts: 5,
      passPct: 50,
    });
    expect(quiz.status).toBe(201);
    quizId = quiz.body.id as number;

    const single = await adminAgent.post(`/api/admin/quizzes/${quizId}/questions`).send({
      bodyHtml: "<p>2+2?</p>",
      type: "single",
    });
    qSingle = single.body.id as number;
    const sa1 = await adminAgent.post(`/api/admin/questions/${qSingle}/answers`).send({ body: "4", isCorrect: true });
    aSingleCorrect = sa1.body.id as number;
    const sa2 = await adminAgent.post(`/api/admin/questions/${qSingle}/answers`).send({ body: "5", isCorrect: false });
    aSingleWrong = sa2.body.id as number;

    const multi = await adminAgent.post(`/api/admin/quizzes/${quizId}/questions`).send({
      bodyHtml: "<p>Even numbers?</p>",
      type: "multiple",
    });
    qMultiple = multi.body.id as number;
    const m1 = await adminAgent.post(`/api/admin/questions/${qMultiple}/answers`).send({ body: "2", isCorrect: true });
    aMultiCorrect1 = m1.body.id as number;
    const m2 = await adminAgent.post(`/api/admin/questions/${qMultiple}/answers`).send({ body: "4", isCorrect: true });
    aMultiCorrect2 = m2.body.id as number;
    const m3 = await adminAgent.post(`/api/admin/questions/${qMultiple}/answers`).send({ body: "3", isCorrect: false });
    aMultiWrong = m3.body.id as number;
    expect(aMultiWrong).toBeGreaterThan(0);
    expect(aSingleWrong).toBeGreaterThan(0);

    const text = await adminAgent.post(`/api/admin/quizzes/${quizId}/questions`).send({
      bodyHtml: "<p>Capital of BiH?</p>",
      type: "text",
      expectedText: "Sarajevo",
    });
    qText = text.body.id as number;
  }, 30000);

  it("student can list modules", async () => {
    const res = await studentAgent!.get("/api/modules");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("play payload contains no isCorrect key", async () => {
    const res = await studentAgent!.post(`/api/quizzes/${quizId}/play`);
    expect(res.status).toBe(201);
    expect(res.body.attemptId).toBeGreaterThan(0);
    assertNoIsCorrectKey(res.body);
  });

  it("second play resumes the open attempt with 200", async () => {
    const first = await studentAgent!.post(`/api/quizzes/${quizId}/play`);
    const second = await studentAgent!.post(`/api/quizzes/${quizId}/play`);
    expect(second.status).toBe(200);
    expect(second.body.attemptId).toBe(first.body.attemptId);
  });
  it("submit all-correct scores maxScore", async () => {
    // Fresh play returns the open attempt (same attemptId) with status 200 (resume)
    const play = await studentAgent!.post(`/api/quizzes/${quizId}/play`);
    expect([200, 201]).toContain(play.status);
    const attemptId = play.body.attemptId as number;

    const submit = await studentAgent!.post(`/api/quizzes/${quizId}/submit`).send({
      attemptId,
      answers: [
        { questionId: qSingle, answerIds: [aSingleCorrect] },
        { questionId: qMultiple, answerIds: [aMultiCorrect1, aMultiCorrect2] },
        { questionId: qText, text: "Sarajevo" },
      ],
    });
    expect(submit.status).toBe(200);
    expect(submit.body.score).toBe(submit.body.maxScore);
    expect(submit.body.maxScore).toBe(3);
  });

  it("partial multiple scores false, double-submit is 400", async () => {
    const play = await studentAgent!.post(`/api/quizzes/${quizId}/play`);
    expect([200, 201]).toContain(play.status);
    const attemptId = play.body.attemptId as number;

    const submit = await studentAgent!.post(`/api/quizzes/${quizId}/submit`).send({
      attemptId,
      answers: [
        { questionId: qSingle, answerIds: [aSingleCorrect] },
        { questionId: qMultiple, answerIds: [aMultiCorrect1] }, // partial → incorrect
        { questionId: qText, text: "Sarajevo" },
      ],
    });
    expect(submit.status).toBe(200);
    const review = submit.body.review as { questionId: number; correct: boolean }[];
    const multiEntry = review.find((r) => r.questionId === qMultiple);
    expect(multiEntry).toBeDefined();
    expect(multiEntry!.correct).toBe(false);

    const again = await studentAgent!.post(`/api/quizzes/${quizId}/submit`).send({
      attemptId,
      answers: [
        { questionId: qSingle, answerIds: [aSingleCorrect] },
        { questionId: qMultiple, answerIds: [aMultiCorrect1, aMultiCorrect2] },
        { questionId: qText, text: "Sarajevo" },
      ],
    });
    expect(again.status).toBe(400);
  });
});
