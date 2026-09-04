/** Test data for the ranking list: ~28 players + spread-out first attempts.
 *  Idempotent: wipes attempts of test users, then recreates deterministically.
 *  Run: pnpm --filter api db:seed:leaderboard */
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const PEOPLE: [string, string, string, string | null, string | null][] = [
  // first, last, username, country, city
  ["Amina", "Hodžić", "amina_h", "BiH", "Sarajevo"],
  ["Tarik", "Muratović", "tarik_m", "BiH", "Sarajevo"],
  ["Lejla", "Softić", "lejla_s", "BiH", "Mostar"],
  ["Adnan", "Karić", "adnan_k", "BiH", "Tuzla"],
  ["Emina", "Delić", "emina_d", "BiH", "Zenica"],
  ["Faruk", "Hadžić", "faruk_h", "BiH", "Banja Luka"],
  ["Selma", "Omanović", "selma_o", "BiH", "Bihać"],
  ["Haris", "Bećirović", "haris_b", "BiH", "Sarajevo"],
  ["Dženita", "Alić", "dzenita_a", "BiH", "Mostar"],
  ["Kenan", "Salkić", "kenan_s", "BiH", "Tuzla"],
  ["Merima", "Husić", "merima_h", "BiH", "Sarajevo"],
  ["Emir", "Zukić", "emir_z", "BiH", "Zenica"],
  ["Aida", "Mehić", "aida_m", "BiH", "Mostar"],
  ["Damir", "Jusić", "damir_j", "BiH", "Sarajevo"],
  ["Nermina", "Kovačević", "nermina_k", "Srbija", "Beograd"],
  ["Stefan", "Jovanović", "stefan_j", "Srbija", "Novi Sad"],
  ["Milica", "Petrović", "milica_p", "Srbija", "Niš"],
  ["Nikola", "Nikolić", "nikola_n", "Hrvatska", "Zagreb"],
  ["Petra", "Horvat", "petra_h", "Hrvatska", "Split"],
  ["Ivan", "Kovač", "ivan_k", "Hrvatska", "Rijeka"],
  ["Sara", "Mujakić", "sara_m", "BiH", "Sarajevo"],
  ["Alen", "Džafić", "alen_d", "BiH", "Tuzla"],
  ["Naida", "Fejzić", "naida_f", "BiH", "Mostar"],
  ["Jasmin", "Gutić", "jasmin_g", "BiH", "Zenica"],
  ["Belma", "Šehić", "belma_s", "BiH", "Sarajevo"],
  ["Mirza", "Tabaković", "mirza_t", "BiH", "Bihać"],
  ["Elma", "Ramić", "elma_r", "Crna Gora", "Podgorica"],
  ["Vedad", "Smajić", "vedad_s", "BiH", "Sarajevo"],
];

const EXTRA_QUIZZES: { name: string; description: string; questions: { bodyHtml: string; type: "single"; answers: [string, boolean][] }[] }[] = [
  {
    name: "Opće znanje",
    description: "Pet brzih pitanja iz općeg znanja.",
    questions: [
      { bodyHtml: "<p>Koji je najveći kontinent?</p>", type: "single", answers: [["Afrika", false], ["Azija", true], ["Evropa", false]] },
      { bodyHtml: "<p>Koliko minuta ima sat?</p>", type: "single", answers: [["60", true], ["100", false], ["90", false]] },
      { bodyHtml: "<p>Koji planet je najbliži Suncu?</p>", type: "single", answers: [["Venera", false], ["Merkur", true], ["Mars", false]] },
      { bodyHtml: "<p>Koliko kontinenata ima na Zemlji?</p>", type: "single", answers: [["5", false], ["6", false], ["7", true]] },
      { bodyHtml: "<p>Koji okean je najveći?</p>", type: "single", answers: [["Atlantski", false], ["Indijski", false], ["Tihi", true]] },
    ],
  },
  {
    name: "Brzi izazov",
    description: "Četiri pitanja, malo vremena.",
    questions: [
      { bodyHtml: "<p>Koliko je 7 × 8?</p>", type: "single", answers: [["54", false], ["56", true], ["63", false]] },
      { bodyHtml: "<p>Koji je hemijski simbol vode?</p>", type: "single", answers: [["H2O", true], ["CO2", false], ["O2", false]] },
      { bodyHtml: "<p>Koliko dana ima prestupna godina?</p>", type: "single", answers: [["365", false], ["366", true], ["364", false]] },
      { bodyHtml: "<p>Koja boja nastaje miješanjem plave i žute?</p>", type: "single", answers: [["Ljubičasta", false], ["Zelena", true], ["Narandžasta", false]] },
    ],
  },
];

/** Deterministic pseudo-random from index (stable across runs). */
function rand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

async function ensureQuiz(name: string, description: string, questions: typeof EXTRA_QUIZZES[number]["questions"], moduleId: number, sortBase: number) {
  let quiz = await prisma.quiz.findFirst({ where: { name } });
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: { name, description, introHtml: "<p>Sretno!</p>", timeLimitSec: 600, maxAttempts: 3, passPct: 50 },
    });
    await prisma.quizModule.upsert({
      where: { quizId_moduleId: { quizId: quiz.id, moduleId } },
      update: {},
      create: { quizId: quiz.id, moduleId },
    });
    for (const [i, q] of questions.entries()) {
      await prisma.question.create({
        data: {
          bodyHtml: q.bodyHtml,
          type: q.type,
          quizzes: { create: { quizId: quiz.id, sortOrder: sortBase + i } },
          answers: { create: q.answers.map(([body, isCorrect]) => ({ body, isCorrect })) },
        },
      });
    }
    console.log(`created quiz "${name}" id=${quiz.id}`);
  }
  const count = await prisma.quizQuestion.count({ where: { quizId: quiz.id } });
  return { id: quiz.id, maxScore: count };
}

async function main() {
  const mod = await prisma.module.findFirst({ orderBy: { moduleNumber: "asc" } });
  if (!mod) throw new Error("No module found — run db:seed first.");
  if (mod.status !== "InProgress") {
    await prisma.module.update({ where: { id: mod.id }, data: { status: "InProgress" } });
  }

  const demo = await prisma.quiz.findFirst({ where: { name: "Demo kviz" } });
  if (!demo) throw new Error("Demo kviz missing — run db:seed first.");
  const demoCount = await prisma.quizQuestion.count({ where: { quizId: demo.id } });

  const quizzes = [
    { id: demo.id, maxScore: demoCount },
    await ensureQuiz(EXTRA_QUIZZES[0].name, EXTRA_QUIZZES[0].description, EXTRA_QUIZZES[0].questions, mod.id, 0),
    await ensureQuiz(EXTRA_QUIZZES[1].name, EXTRA_QUIZZES[1].description, EXTRA_QUIZZES[1].questions, mod.id, 0),
  ];
  const maxTotal = quizzes.reduce((s, q) => s + q.maxScore, 0);
  console.log(`quizzes: ${quizzes.map((q) => `${q.id}(${q.maxScore})`).join(", ")} maxTotal=${maxTotal}`);

  const passwordHash = await bcrypt.hash("password123", 10);
  const now = Date.now();
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(12, 0, 0, 0);

  for (const [i, [first, last, username, country, city]] of PEOPLE.entries()) {
    const email = `test${String(i + 1).padStart(2, "0")}@plusultra.ba`;
    const user = await prisma.user.upsert({
      where: { emailNormalized: email },
      update: { firstName: first, lastName: last, username, country, city, role: "student", emailVerifiedAt: new Date() },
      create: {
        email,
        emailNormalized: email,
        passwordHash,
        firstName: first,
        lastName: last,
        username,
        country,
        city,
        role: "student",
        emailVerifiedAt: new Date(),
      },
    });

    // Fresh attempts for this test user.
    await prisma.attempt.deleteMany({ where: { userId: user.id } });

    const r = rand(i + 1);
    // Skill curve: first users strongest, tail weaker — with noise for realism.
    const skill = 1 - i / PEOPLE.length;
    const quizCount = i % 7 === 6 ? 1 : i % 3 === 2 ? 2 : 3;

    for (const [qi, q] of quizzes.slice(0, quizCount).entries()) {
      const noise = (r() - 0.5) * 0.35;
      const ratio = Math.min(1, Math.max(0.08, skill * 0.85 + 0.2 + noise - qi * 0.06));
      const score = Math.min(q.maxScore, Math.round(ratio * q.maxScore));
      // Faster players tend to score higher; duration in seconds.
      const durationSec = Math.round(40 + (1 - ratio) * 320 + r() * 60);
      // Spread dates: most this month (current filter shows data), some older.
      const daysAgo = i % 4 === 3 ? 35 + Math.floor(r() * 25) : Math.floor(r() * 20);
      const submittedAt = new Date(now - daysAgo * 86400000 - Math.floor(r() * 80000) * 1000);

      await prisma.attempt.create({
        data: {
          userId: user.id,
          quizId: q.id,
          attemptNo: 1,
          startedAt: new Date(submittedAt.getTime() - durationSec * 1000),
          submittedAt,
          score,
          maxScore: q.maxScore,
          durationSec,
          playOrder: "[]",
          answersJson: "[]",
        },
      });
    }
  }

  const board = await prisma.attempt.groupBy({
    by: ["userId"],
    where: { attemptNo: 1, submittedAt: { not: null } },
    _sum: { score: true },
  });
  console.log(`seeded ${PEOPLE.length} test users, ${board.length} ranked players (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
