/** Demo mode (VITE_DEMO_MODE=true): in-memory API mock for the static
 *  GitHub Pages build. No persistence across refresh (except the session).
 *  Response shapes mirror the real backend 1:1. */

export const isDemo = import.meta.env.VITE_DEMO_MODE === "true";

const SESSION_KEY = "v2-demo-session";

interface DemoUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  country: string | null;
  city: string | null;
  bio: string | null;
  nickname: string | null;
  username: string | null;
  avatarFile: string | null;
}

interface DemoAnswer {
  id: number;
  body: string;
  isCorrect: boolean;
}

interface DemoQuestion {
  id: number;
  bodyHtml: string;
  type: string;
  expectedText: string | null;
  answers: DemoAnswer[];
}

interface DemoAttempt {
  id: number;
  userId: number;
  quizId: number;
  attemptNo: number;
  startedAt: number;
  submittedAt: number | null;
  score: number;
  durationSec: number;
  answers: { questionId: number; answerIds?: number[]; text?: string }[];
  order: { questionId: number; answerIds: number[] }[];
}

let seq = { user: 100, quiz: 100, question: 100, answer: 1000, attempt: 100, module: 100 };

const users: DemoUser[] = [
  { id: 1, email: "admin@plusultra.ba", password: "admin12345", firstName: "Admin", lastName: "PlusUltra", role: "admin", country: null, city: null, bio: null, nickname: null, username: "admin", avatarFile: "demo:AU" },
  { id: 2, email: "student@gmail.com", password: "password123", firstName: "Demo", lastName: "Student", role: "student", country: "BiH", city: "Sarajevo", bio: "Volim kvizove.", nickname: null, username: "demo_student", avatarFile: "demo:DS" },
  { id: 3, email: "ana@gmail.com", password: "password123", firstName: "Ana", lastName: "Anić", role: "student", country: "BiH", city: "Mostar", bio: null, nickname: null, username: "ana_a", avatarFile: null },
  { id: 4, email: "marko@gmail.com", password: "password123", firstName: "Marko", lastName: "Marković", role: "student", country: "Srbija", city: "Beograd", bio: null, nickname: null, username: "marko_m", avatarFile: null },
  { id: 5, email: "amina@demo.ba", password: "password123", firstName: "Amina", lastName: "Hodžić", role: "student", country: "BiH", city: "Sarajevo", bio: null, nickname: null, username: "amina_h", avatarFile: null },
  { id: 6, email: "tarik@demo.ba", password: "password123", firstName: "Tarik", lastName: "Muratović", role: "student", country: "BiH", city: "Sarajevo", bio: null, nickname: null, username: "tarik_m", avatarFile: null },
  { id: 7, email: "lejla@demo.ba", password: "password123", firstName: "Lejla", lastName: "Softić", role: "student", country: "BiH", city: "Mostar", bio: null, nickname: null, username: "lejla_s", avatarFile: null },
  { id: 8, email: "adnan@demo.ba", password: "password123", firstName: "Adnan", lastName: "Karić", role: "student", country: "BiH", city: "Tuzla", bio: null, nickname: null, username: "adnan_k", avatarFile: null },
  { id: 9, email: "emina@demo.ba", password: "password123", firstName: "Emina", lastName: "Delić", role: "student", country: "BiH", city: "Zenica", bio: null, nickname: null, username: "emina_d", avatarFile: null },
  { id: 10, email: "haris@demo.ba", password: "password123", firstName: "Haris", lastName: "Bećirović", role: "student", country: "BiH", city: "Sarajevo", bio: null, nickname: null, username: "haris_b", avatarFile: null },
  { id: 11, email: "selma@demo.ba", password: "password123", firstName: "Selma", lastName: "Omanović", role: "student", country: "BiH", city: "Bihać", bio: null, nickname: null, username: "selma_o", avatarFile: null },
  { id: 12, email: "kenan@demo.ba", password: "password123", firstName: "Kenan", lastName: "Salkić", role: "student", country: "BiH", city: "Tuzla", bio: null, nickname: null, username: "kenan_s", avatarFile: null },
  { id: 13, email: "milica@demo.ba", password: "password123", firstName: "Milica", lastName: "Petrović", role: "student", country: "Srbija", city: "Niš", bio: null, nickname: null, username: "milica_p", avatarFile: null },
  { id: 14, email: "nikola@demo.ba", password: "password123", firstName: "Nikola", lastName: "Nikolić", role: "student", country: "Hrvatska", city: "Zagreb", bio: null, nickname: null, username: "nikola_n", avatarFile: null },
  { id: 15, email: "petra@demo.ba", password: "password123", firstName: "Petra", lastName: "Horvat", role: "student", country: "Hrvatska", city: "Split", bio: null, nickname: null, username: "petra_h", avatarFile: null },
  { id: 16, email: "sara@demo.ba", password: "password123", firstName: "Sara", lastName: "Mujakić", role: "student", country: "BiH", city: "Sarajevo", bio: null, nickname: null, username: "sara_m", avatarFile: null },
];

const modules = [
  { id: 1, name: "Demo modul", shortDesc: "Uvodni modul za demonstraciju.", longDesc: "Isprobaj kvizove, rang listu i admin panel.", editionLabel: "2025/26", moduleNumber: 1, startAt: new Date().toISOString(), endAt: new Date(Date.now() + 90 * 86400000).toISOString(), status: "InProgress", quizIds: [1, 2] },
];

const quizzes: { id: number; name: string; description: string; introHtml: string; timeLimitSec: number; maxAttempts: number; passPct: number; questions: DemoQuestion[] }[] = [
  {
    id: 1, name: "Demo kviz", description: "Probni kviz sa po jednim pitanjem svakog tipa.",
    introHtml: "<p>Dobrodošli u demo! Sretno :)</p>", timeLimitSec: 600, maxAttempts: 3, passPct: 50,
    questions: [
      { id: 1, bodyHtml: "<p>Koliko je 2 + 2?</p>", type: "single", expectedText: null, answers: [
        { id: 1, body: "3", isCorrect: false }, { id: 2, body: "4", isCorrect: true }, { id: 3, body: "5", isCorrect: false }] },
      { id: 2, bodyHtml: "<p>Koji su parni brojevi?</p>", type: "multiple", expectedText: null, answers: [
        { id: 4, body: "2", isCorrect: true }, { id: 5, body: "3", isCorrect: false }, { id: 6, body: "4", isCorrect: true }] },
      { id: 3, bodyHtml: "<p>Glavni grad BiH?</p>", type: "text", expectedText: "Sarajevo", answers: [] },
    ],
  },
  {
    id: 2, name: "Brzi kviz", description: "Kratka provjera znanja.",
    introHtml: "<p>Samo 2 pitanja.</p>", timeLimitSec: 300, maxAttempts: 3, passPct: 50,
    questions: [
      { id: 4, bodyHtml: "<p>Koliko je 3 × 3?</p>", type: "single", expectedText: null, answers: [
        { id: 7, body: "6", isCorrect: false }, { id: 8, body: "9", isCorrect: true }] },
      { id: 5, bodyHtml: "<p>Boje zastave BiH?</p>", type: "multiple", expectedText: null, answers: [
        { id: 9, body: "Plava", isCorrect: true }, { id: 10, body: "Žuta", isCorrect: true }, { id: 11, body: "Zelena", isCorrect: false }] },
    ],
  },
];

const H = 3600000;
const attempts: DemoAttempt[] = [
  { id: 1, userId: 3, quizId: 1, attemptNo: 1, startedAt: Date.now() - 120000, submittedAt: Date.now() - 60000, score: 2, durationSec: 60, answers: [], order: [] },
  { id: 2, userId: 4, quizId: 1, attemptNo: 1, startedAt: Date.now() - 200000, submittedAt: Date.now() - 100000, score: 3, durationSec: 100, answers: [], order: [] },
  // Spread-out demo board: recent + older entries so month filter has data.
  { id: 3, userId: 5, quizId: 1, attemptNo: 1, startedAt: Date.now() - 3 * H, submittedAt: Date.now() - 3 * H + 90000, score: 3, durationSec: 90, answers: [], order: [] },
  { id: 4, userId: 5, quizId: 2, attemptNo: 1, startedAt: Date.now() - 2 * H, submittedAt: Date.now() - 2 * H + 120000, score: 2, durationSec: 120, answers: [], order: [] },
  { id: 5, userId: 6, quizId: 1, attemptNo: 1, startedAt: Date.now() - 5 * H, submittedAt: Date.now() - 5 * H + 70000, score: 3, durationSec: 70, answers: [], order: [] },
  { id: 6, userId: 6, quizId: 2, attemptNo: 1, startedAt: Date.now() - 4 * H, submittedAt: Date.now() - 4 * H + 150000, score: 2, durationSec: 150, answers: [], order: [] },
  { id: 7, userId: 7, quizId: 1, attemptNo: 1, startedAt: Date.now() - 26 * H, submittedAt: Date.now() - 26 * H + 110000, score: 2, durationSec: 110, answers: [], order: [] },
  { id: 8, userId: 8, quizId: 1, attemptNo: 1, startedAt: Date.now() - 8 * H, submittedAt: Date.now() - 8 * H + 95000, score: 2, durationSec: 95, answers: [], order: [] },
  { id: 9, userId: 8, quizId: 2, attemptNo: 1, startedAt: Date.now() - 7 * H, submittedAt: Date.now() - 7 * H + 130000, score: 1, durationSec: 130, answers: [], order: [] },
  { id: 10, userId: 9, quizId: 1, attemptNo: 1, startedAt: Date.now() - 10 * H, submittedAt: Date.now() - 10 * H + 80000, score: 3, durationSec: 80, answers: [], order: [] },
  { id: 11, userId: 10, quizId: 1, attemptNo: 1, startedAt: Date.now() - 12 * H, submittedAt: Date.now() - 12 * H + 140000, score: 2, durationSec: 140, answers: [], order: [] },
  { id: 12, userId: 11, quizId: 1, attemptNo: 1, startedAt: Date.now() - 40 * 24 * H, submittedAt: Date.now() - 40 * 24 * H + 100000, score: 3, durationSec: 100, answers: [], order: [] },
  { id: 13, userId: 12, quizId: 1, attemptNo: 1, startedAt: Date.now() - 30 * H, submittedAt: Date.now() - 30 * H + 170000, score: 1, durationSec: 170, answers: [], order: [] },
  { id: 14, userId: 13, quizId: 1, attemptNo: 1, startedAt: Date.now() - 15 * H, submittedAt: Date.now() - 15 * H + 125000, score: 2, durationSec: 125, answers: [], order: [] },
  { id: 15, userId: 14, quizId: 1, attemptNo: 1, startedAt: Date.now() - 20 * H, submittedAt: Date.now() - 20 * H + 160000, score: 1, durationSec: 160, answers: [], order: [] },
  { id: 16, userId: 15, quizId: 2, attemptNo: 1, startedAt: Date.now() - 9 * H, submittedAt: Date.now() - 9 * H + 110000, score: 2, durationSec: 110, answers: [], order: [] },
  { id: 17, userId: 16, quizId: 1, attemptNo: 1, startedAt: Date.now() - 50 * 24 * H, submittedAt: Date.now() - 50 * 24 * H + 90000, score: 2, durationSec: 90, answers: [], order: [] },
  { id: 18, userId: 2, quizId: 1, attemptNo: 1, startedAt: Date.now() - 6 * H, submittedAt: Date.now() - 6 * H + 105000, score: 2, durationSec: 105, answers: [], order: [] },
];

function sessionUser(): DemoUser | null {
  const id = Number(localStorage.getItem(SESSION_KEY) ?? 0);
  return users.find((u) => u.id === id) ?? null;
}

function pub(u: DemoUser) {
  const { password: _pw, ...rest } = u;
  return rest;
}

function fail(message: string): never {
  throw new Error(message);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function norm(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Score with the exact server rules. Exported for AdminPreview parity. */
export function scoreAnswers(
  questions: DemoQuestion[],
  answers: { questionId: number; answerIds?: number[]; text?: string }[]
) {
  const byQ = new Map(answers.map((a) => [a.questionId, a]));
  return questions.map((q) => {
    const g = byQ.get(q.id);
    let correct = false;
    if (g) {
      if (q.type === "single") {
        const right = q.answers.find((a) => a.isCorrect);
        correct = (g.answerIds?.length ?? 0) === 1 && g.answerIds![0] === right?.id;
      } else if (q.type === "multiple") {
        const right = new Set(q.answers.filter((a) => a.isCorrect).map((a) => a.id));
        const picked = new Set(g.answerIds ?? []);
        correct = picked.size > 0 && right.size === picked.size && [...right].every((id) => picked.has(id));
      } else {
        correct = !!q.expectedText && norm(g.text ?? "") === norm(q.expectedText);
      }
    }
    return { questionId: q.id, correct };
  });
}

function requireAuth(): DemoUser {
  const u = sessionUser();
  if (!u) fail("Unauthenticated");
  return u!;
}

function requireAdmin(): DemoUser {
  const u = requireAuth();
  if (u.role !== "admin") fail("Forbidden");
  return u;
}

function quizDetail(q: (typeof quizzes)[number], admin: boolean) {
  return {
    ...q,
    moduleIds: modules.filter((m) => m.quizIds.includes(q.id)).map((m) => m.id),
    questions: q.questions.map((x, i) => ({
      id: x.id,
      bodyHtml: x.bodyHtml,
      type: x.type,
      expectedText: x.expectedText,
      imageFile: null,
      imageUrl: null,
      sortOrder: i,
      answers: admin ? x.answers : x.answers.map((a) => ({ id: a.id, body: a.body })),
    })),
  };
}

export async function mockApi(path: string, init: RequestInit = {}): Promise<any> {
  const method = (init.method ?? "GET").toUpperCase();
  const body = init.body ? JSON.parse(init.body as string) : {};
  const [url, query] = path.split("?");
  const params = new URLSearchParams(query ?? "");
  const seg = (i: number) => url.split("/")[i];

  // ---- auth ----
  if (url === "/api/auth/register" && method === "POST") {
    if (users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) fail("Korisnik vec postoji.");
    const u: DemoUser = { id: ++seq.user, email: body.email, password: body.password, firstName: body.firstName, lastName: body.lastName, role: "student", country: body.country ?? null, city: body.city ?? null, bio: null, nickname: null, username: null, avatarFile: null };
    users.push(u);
    return { userId: u.id };
  }
  if (url === "/api/auth/verify-email" && method === "POST") return { ok: true };
  if (url === "/api/auth/login" && method === "POST") {
    const u = users.find((x) => x.email.toLowerCase() === body.email.toLowerCase());
    if (!u || u.password !== body.password) fail("Pogresan email ili lozinka.");
    localStorage.setItem(SESSION_KEY, String(u.id));
    return { user: pub(u) };
  }
  if (url === "/api/auth/refresh" && method === "POST") {
    const u = sessionUser();
    if (!u) fail("Unauthenticated");
    return { user: pub(u) };
  }
  if (url === "/api/auth/logout" && method === "POST") {
    localStorage.removeItem(SESSION_KEY);
    return { ok: true };
  }
  if (url === "/api/auth/forgot" && method === "POST") return { ok: true };
  if (url === "/api/auth/reset" && method === "POST") {
    const u = users.find((x) => x.email.toLowerCase() === body.email.toLowerCase());
    if (!u) fail("Neispravan kod.");
    u.password = body.newPassword;
    return { ok: true };
  }

  // ---- me ----
  if (url === "/api/me" && method === "GET") return { user: pub(requireAuth()) };
  if (url === "/api/me" && method === "PATCH") {
    const u = requireAuth();
    Object.assign(u, { firstName: body.firstName ?? u.firstName, lastName: body.lastName ?? u.lastName, country: body.country ?? u.country, city: body.city ?? u.city, bio: body.bio ?? u.bio, nickname: body.nickname ?? u.nickname, username: body.username ?? u.username });
    return { user: pub(u) };
  }
  if (url === "/api/me/password" && method === "PUT") {
    const u = requireAuth();
    if (body.currentPassword !== u.password) fail("Trenutna lozinka nije tacna.");
    u.password = body.newPassword;
    return { ok: true };
  }
  if (url === "/api/me/avatar" && method === "DELETE") {
    const u = requireAuth();
    u.avatarFile = null;
    return { user: pub(u) };
  }

  // ---- student ----
  if (url === "/api/editions" && method === "GET") {
    requireAuth();
    return [...new Set(modules.map((m) => m.editionLabel))];
  }
  if (url === "/api/modules" && method === "GET") {
    requireAuth();
    const ed = params.get("edition");
    return modules
      .filter((m) => !ed || m.editionLabel === ed)
      .map((m) => ({ ...m, quizIds: undefined, totalQuizzes: m.quizIds.length }));
  }
  if (seg(1) === "api" && seg(2) === "modules" && seg(4) === undefined && method === "GET") {
    const me = requireAuth();
    const m = modules.find((x) => x.id === Number(seg(3)));
    if (!m) fail("Modul nije pronadjen.");
    return {
      ...m, quizIds: undefined,
      quizzes: m!.quizIds.map((qid) => {
        const q = quizzes.find((x) => x.id === qid)!;
        const done = attempts.filter((a) => a.quizId === qid && a.userId === me.id && a.submittedAt);
        return { quizId: q.id, quizName: q.name, description: q.description, timeLimitSec: q.timeLimitSec, maxAttempts: q.maxAttempts, questionCount: q.questions.length, myAttempts: done.length, canAttempt: done.length < q.maxAttempts, lastScore: done[done.length - 1]?.score ?? null };
      }),
    };
  }
  if (seg(1) === "api" && seg(2) === "quizzes" && seg(4) === undefined && method === "GET") {
    const me = requireAuth();
    const q = quizzes.find((x) => x.id === Number(seg(3)));
    if (!q) fail("Kviz nije pronadjen.");
    const done = attempts.filter((a) => a.quizId === q.id && a.userId === me.id && a.submittedAt);
    const modId = modules.find((m) => m.quizIds.includes(q.id))?.id ?? null;
    return { id: q.id, name: q.name, description: q.description, introHtml: q.introHtml, timeLimitSec: q.timeLimitSec, maxAttempts: q.maxAttempts, passPct: q.passPct, questionCount: q.questions.length, moduleId: modId, myAttempts: done.length, canAttempt: done.length < q.maxAttempts };
  }
  if (seg(1) === "api" && seg(2) === "quizzes" && seg(4) === "play" && method === "POST") {
    const me = requireAuth();
    const q = quizzes.find((x) => x.id === Number(seg(3)));
    if (!q) fail("Kviz nije pronadjen.");
    const live = attempts.find((a) => a.quizId === q.id && a.userId === me.id && !a.submittedAt);
    if (live) {
      return playPayload(q, live, true);
    }
    const done = attempts.filter((a) => a.quizId === q.id && a.userId === me.id && a.submittedAt).length;
    if (done >= q.maxAttempts) fail("Iskoristili ste sve pokusaje.");
    const order = shuffle(q.questions.map((x) => ({ questionId: x.id, answerIds: shuffle(x.answers.map((a) => a.id)) })));
    const att: DemoAttempt = { id: ++seq.attempt, userId: me.id, quizId: q.id, attemptNo: done + 1, startedAt: Date.now(), submittedAt: null, score: 0, durationSec: 0, answers: [], order };
    attempts.push(att);
    return playPayload(q, att, false);
  }
  if (seg(1) === "api" && seg(2) === "quizzes" && seg(4) === "submit" && method === "POST") {
    const me = requireAuth();
    const q = quizzes.find((x) => x.id === Number(seg(3)));
    if (!q) fail("Kviz nije pronadjen.");
    const att = attempts.find((a) => a.id === body.attemptId && a.quizId === q.id && a.userId === me.id);
    if (!att) fail("Pokusaj nije pronadjen.");
    if (att.submittedAt) fail("Kviz je vec predat.");
    for (const a of body.answers as { questionId: number }[]) {
      if (!q.questions.some((x) => x.id === a.questionId)) fail("Nepoznato pitanje u odgovorima.");
    }
    const review = scoreAnswers(q.questions, body.answers);
    const score = review.filter((r) => r.correct).length;
    att.submittedAt = Date.now();
    att.score = score;
    att.durationSec = Math.floor((att.submittedAt - att.startedAt) / 1000);
    att.answers = body.answers;
    return { attemptId: att.id, score, maxScore: q.questions.length, durationSec: att.durationSec, passed: score / q.questions.length >= q.passPct / 100, review };
  }
  if (seg(1) === "api" && seg(2) === "attempts" && method === "GET") {
    const me = requireAuth();
    const att = attempts.find((a) => a.id === Number(seg(3)));
    if (!att || !att.submittedAt) fail("Rezultat nije pronadjen.");
    if (att.userId !== me.id && me.role !== "admin") fail("Forbidden");
    const q = quizzes.find((x) => x.id === att.quizId)!;
    const byA = new Map(att.answers.map((a) => [a.questionId, a]));
    return {
      attemptId: att.id, quizId: q.id, quizName: q.name, score: att.score, maxScore: q.questions.length, durationSec: att.durationSec,
      review: q.questions.map((x) => ({ questionId: x.id, type: x.type, bodyHtml: x.bodyHtml, imageUrl: null, answers: x.answers, userAnswerIds: byA.get(x.id)?.answerIds ?? [], userText: byA.get(x.id)?.text ?? null })),
    };
  }
  if (url === "/api/leaderboard" && method === "GET") {
    requireAuth();
    return leaderboard(params.get("month")).slice(0, Math.min(Math.max(Number(params.get("limit") ?? 50), 1), 200));
  }
  if (seg(1) === "api" && seg(2) === "users" && method === "GET") {
    requireAuth();
    const u = users.find((x) => x.id === Number(seg(3)));
    if (!u) fail("Korisnik nije pronadjen.");
    const firsts = attempts.filter((a) => a.userId === u.id && a.attemptNo === 1 && a.submittedAt);
    const board = leaderboard();
    return { userId: u.id, firstName: u.firstName, lastName: u.lastName, username: u.username, country: u.country, city: u.city, bio: u.bio, avatarFile: u.avatarFile, avatarUrl: null, totalScore: firsts.reduce((s, a) => s + a.score, 0), quizzesPlayed: firsts.length, rank: board.find((r) => r.userId === u.id)?.rank ?? null };
  }

  // ---- admin ----
  const adm = () => requireAdmin();
  if (url === "/api/admin/modules" && method === "GET") {
    adm();
    return modules.map((m) => ({ ...m, quizIds: undefined, totalQuizzes: m.quizIds.length }));
  }
  if (url === "/api/admin/modules" && method === "POST") {
    adm();
    const m = { id: ++seq.module, name: body.name, shortDesc: body.shortDesc, longDesc: body.longDesc, editionLabel: body.editionLabel, moduleNumber: body.moduleNumber, startAt: body.startAt, endAt: body.endAt, status: "Locked", quizIds: [] as number[] };
    modules.push(m);
    return { ...m, quizIds: undefined };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "modules" && seg(5) === undefined && method === "PUT") {
    adm();
    const m = modules.find((x) => x.id === Number(seg(4)));
    if (!m) fail("Modul nije pronadjen.");
    Object.assign(m, body);
    return { ...m, quizIds: undefined };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "modules" && seg(5) === undefined && method === "DELETE") {
    adm();
    const i = modules.findIndex((x) => x.id === Number(seg(4)));
    if (i < 0) fail("Modul nije pronadjen.");
    modules.splice(i, 1);
    return { ok: true };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "quizzes" && method === "GET") {
    adm();
    const q = quizzes.find((x) => x.id === Number(seg(4)));
    if (!q) fail("Kviz nije pronadjen.");
    return quizDetail(q, true);
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "modules" && seg(5) === "quizzes" && method === "POST") {
    adm();
    const m = modules.find((x) => x.id === Number(seg(4)));
    if (!m) fail("Modul nije pronadjen.");
    const q = { id: ++seq.quiz, name: body.name, description: body.description ?? "", introHtml: body.introHtml ?? "", timeLimitSec: body.timeLimitSec ?? 600, maxAttempts: body.maxAttempts ?? 3, passPct: body.passPct ?? 50, questions: [] as DemoQuestion[] };
    quizzes.push(q);
    m.quizIds.push(q.id);
    return q;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "quizzes" && seg(5) === undefined && method === "PUT") {
    adm();
    const q = quizzes.find((x) => x.id === Number(seg(4)));
    if (!q) fail("Kviz nije pronadjen.");
    Object.assign(q, body);
    return q;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "quizzes" && seg(5) === undefined && method === "DELETE") {
    adm();
    const i = quizzes.findIndex((x) => x.id === Number(seg(4)));
    if (i < 0) fail("Kviz nije pronadjen.");
    quizzes.splice(i, 1);
    for (const m of modules) m.quizIds = m.quizIds.filter((id) => id !== Number(seg(4)));
    return { ok: true };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "quizzes" && seg(5) === "questions" && method === "POST") {
    adm();
    const q = quizzes.find((x) => x.id === Number(seg(4)));
    if (!q) fail("Kviz nije pronadjen.");
    const nq: DemoQuestion = { id: ++seq.question, bodyHtml: body.bodyHtml, type: body.type, expectedText: body.expectedText ?? null, answers: [] };
    q.questions.push(nq);
    return nq;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "questions" && seg(5) === undefined && method === "PUT") {
    adm();
    const found = findQuestion(Number(seg(4)));
    if (!found) fail("Pitanje nije pronadjeno.");
    Object.assign(found!.q, body);
    return found!.q;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "questions" && seg(5) === undefined && method === "DELETE") {
    adm();
    const found = findQuestion(Number(seg(4)));
    if (!found) fail("Pitanje nije pronadjeno.");
    found!.quiz.questions = found!.quiz.questions.filter((x) => x.id !== Number(seg(4)));
    return { ok: true };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "questions" && seg(5) === "answers" && method === "POST") {
    adm();
    const found = findQuestion(Number(seg(4)));
    if (!found) fail("Pitanje nije pronadjeno.");
    if (found!.q.type === "single" && body.isCorrect) found!.q.answers.forEach((a) => (a.isCorrect = false));
    const a = { id: ++seq.answer, body: body.body, isCorrect: body.isCorrect ?? false };
    found!.q.answers.push(a);
    return a;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "answers" && method === "PUT") {
    adm();
    const found = findAnswer(Number(seg(4)));
    if (!found) fail("Odgovor nije pronadjen.");
    if (found.q.type === "single" && body.isCorrect) found.q.answers.forEach((a) => (a.isCorrect = false));
    Object.assign(found.a, body);
    return found.a;
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "answers" && method === "DELETE") {
    adm();
    const found = findAnswer(Number(seg(4)));
    if (!found) fail("Odgovor nije pronadjen.");
    found.q.answers = found.q.answers.filter((a) => a.id !== Number(seg(4)));
    return { ok: true };
  }
  if (seg(1) === "api" && seg(2) === "admin" && seg(3) === "questions" && seg(5) === "image" && method === "DELETE") {
    adm();
    return { ok: true };
  }

  fail(`Demo mock: ${method} ${path} nije implementiran.`);
}

function findQuestion(id: number) {
  for (const quiz of quizzes) {
    const q = quiz.questions.find((x) => x.id === id);
    if (q) return { quiz, q };
  }
  return null;
}

function findAnswer(id: number) {
  for (const quiz of quizzes) {
    for (const q of quiz.questions) {
      const a = q.answers.find((x) => x.id === id);
      if (a) return { quiz, q, a };
    }
  }
  return null;
}

function playPayload(q: (typeof quizzes)[number], att: DemoAttempt, resumed: boolean) {
  const byId = new Map(q.questions.map((x) => [x.id, x]));
  return {
    attemptId: att.id,
    attemptNo: att.attemptNo,
    quizId: q.id,
    quizName: q.name,
    timeLimitSec: q.timeLimitSec,
    startedAt: new Date(att.startedAt).toISOString(),
    timeLeftSec: Math.max(0, q.timeLimitSec - Math.floor((Date.now() - att.startedAt) / 1000)),
    resumed,
    questions: att.order.map((e) => {
      const x = byId.get(e.questionId)!;
      const ansById = new Map(x.answers.map((a) => [a.id, a]));
      return { questionId: x.id, type: x.type, bodyHtml: x.bodyHtml, imageUrl: null, answers: e.answerIds.map((id) => ({ id, body: ansById.get(id)!.body })) };
    }),
  };
}

function leaderboard(month?: string | null) {
  const agg = new Map<number, { userId: number; firstName: string; lastName: string; username: string | null; country: string | null; city: string | null; avatarFile: string | null; totalScore: number; totalDurationSec: number; quizzesPlayed: number }>();
  let start = 0;
  let end = Infinity;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    start = Date.UTC(y, m - 1, 1);
    end = Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1);
  }
  for (const a of attempts.filter((x) => x.attemptNo === 1 && x.submittedAt && x.submittedAt >= start && x.submittedAt < end)) {
    const u = users.find((x) => x.id === a.userId)!;
    const cur = agg.get(a.userId) ?? { userId: a.userId, firstName: u.firstName, lastName: u.lastName, username: u.username, country: u.country, city: u.city, avatarFile: u.avatarFile, totalScore: 0, totalDurationSec: 0, quizzesPlayed: 0 };
    cur.totalScore += a.score;
    cur.totalDurationSec += a.durationSec;
    cur.quizzesPlayed += 1;
    agg.set(a.userId, cur);
  }
  return [...agg.values()]
    .sort((x, y) => y.totalScore - x.totalScore || x.totalDurationSec - y.totalDurationSec)
    .map((r, i) => ({ rank: i + 1, ...r }));
}

/** Intercepts the two raw-fetch image uploads in demo mode (FormData posts
 *  that bypass api()). Call once from main.tsx when isDemo. */
export function installDemoFetchShim() {
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url);
    const method = (init?.method ?? "GET").toUpperCase();
    if (method === "POST" && url.includes("/api/me/avatar")) {
      const u = sessionUser();
      if (!u) return new Response(JSON.stringify({ message: "Unauthenticated" }), { status: 401 });
      u.avatarFile = `demo:${(u.username || u.email).slice(0, 2).toUpperCase()}`;
      return new Response(JSON.stringify({ user: pub(u) }), { status: 200 });
    }
    const m = url.match(/\/api\/admin\/questions\/(\d+)\/image$/);
    if (method === "POST" && m) {
      return new Response(JSON.stringify({ imageUrl: null }), { status: 200 });
    }
    return orig(input as any, init);
  };
}
