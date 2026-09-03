import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 12);
  const admin = await prisma.user.upsert({
    where: { emailNormalized: "admin@plusultra.ba" },
    update: {},
    create: {
      email: "admin@plusultra.ba",
      emailNormalized: "admin@plusultra.ba",
      passwordHash,
      firstName: "Admin",
      lastName: "PlusUltra",
      role: "admin",
      emailVerifiedAt: new Date(),
    },
  });

  let mod = await prisma.module.findFirst({ where: { moduleNumber: 1 } });
  if (!mod) {
    mod = await prisma.module.create({
      data: {
        name: "Modul 1",
        shortDesc: "Uvod",
        longDesc: "Uvodni modul",
        editionLabel: "2025/26",
        moduleNumber: 1,
        startAt: new Date(),
        endAt: new Date(Date.now() + 90 * 86400000),
        status: "InProgress",
      },
    });
  }

  // Demo quiz (idempotent by name)
  let quiz = await prisma.quiz.findFirst({ where: { name: "Demo kviz" } });
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        name: "Demo kviz",
        description: "Probni kviz sa po jednim pitanjem svakog tipa.",
        introHtml: "<p>Sretno!</p>",
        timeLimitSec: 600,
        maxAttempts: 3,
        passPct: 50,
      },
    });
    await prisma.quizModule.create({ data: { quizId: quiz.id, moduleId: mod.id } });

    const q1 = await prisma.question.create({
      data: {
        bodyHtml: "<p>Koliko je 2 + 2?</p>",
        type: "single",
        quizzes: { create: { quizId: quiz.id, sortOrder: 0 } },
        answers: {
          create: [
            { body: "3", isCorrect: false },
            { body: "4", isCorrect: true },
            { body: "5", isCorrect: false },
          ],
        },
      },
    });
    const q2 = await prisma.question.create({
      data: {
        bodyHtml: "<p>Koji su parni brojevi?</p>",
        type: "multiple",
        quizzes: { create: { quizId: quiz.id, sortOrder: 1 } },
        answers: {
          create: [
            { body: "2", isCorrect: true },
            { body: "3", isCorrect: false },
            { body: "4", isCorrect: true },
          ],
        },
      },
    });
    await prisma.question.create({
      data: {
        bodyHtml: "<p>Glavni grad BiH?</p>",
        type: "text",
        expectedText: "Sarajevo",
        quizzes: { create: { quizId: quiz.id, sortOrder: 2 } },
      },
    });
    console.log({ questions: [q1.id, q2.id] });
  }
  console.log({ admin: admin.email, module: mod.id, quiz: quiz.id });
}

main().finally(() => prisma.$disconnect());
