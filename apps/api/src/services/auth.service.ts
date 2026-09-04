import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt.js";
import { sendCodeEmail, sendQuizPublishedEmail } from "./mailer.js";

const CODE_TTL_MS = 15 * 60 * 1000;
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS ?? "gmail.com,outlook.com,hotmail.com,yahoo.com,plusultra.ba").split(",");

function sixDigit() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function toPublicUser(u: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarFile: string | null;
  notifyNewQuiz?: boolean;
}) {
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, avatarFile: u.avatarFile, notifyNewQuiz: u.notifyNewQuiz ?? true };
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
}) {
  const emailNormalized = input.email.toLowerCase();
  const domain = emailNormalized.split("@")[1] ?? "";
  if (!ALLOWED_DOMAINS.includes(domain)) {
    const err: any = new Error("Email domena nije dozvoljena.");
    err.status = 400;
    throw err;
  }
  const existing = await prisma.user.findUnique({ where: { emailNormalized } });
  if (existing) {
    const err: any = new Error("Korisnik vec postoji.");
    err.status = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const code = sixDigit();
  // Bootstrap rule: plusultra.ba domain becomes admin ONLY if no admin exists yet.
  // Otherwise everyone registers as student (no self-granted privilege).
  let role = "student";
  if (domain === "plusultra.ba") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount === 0) role = "admin";
  }
  const user = await prisma.user.create({
    data: {
      email: input.email,
      emailNormalized,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      country: input.country,
      city: input.city,
      role,
      verificationHash: hashCode(code),
      verificationExpires: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  try {
    await sendCodeEmail(input.email, code, "verify");
  } catch {
    // Don't leave a stuck unverifiable account if mail fails.
    await prisma.user.delete({ where: { id: user.id } });
    const err: any = new Error("Registracija nije uspjela (email). Pokusajte ponovo.");
    err.status = 500;
    throw err;
  }
  return { userId: user.id };
}

export async function verifyEmail(userId: number, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.verificationHash || !user.verificationExpires) {
    const err: any = new Error("Neispravan kod.");
    err.status = 400;
    throw err;
  }
  if (user.verificationExpires < new Date() || hashCode(code) !== user.verificationHash) {
    const err: any = new Error("Neispravan ili istekao kod.");
    err.status = 400;
    throw err;
  }
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date(), verificationHash: null, verificationExpires: null },
  });
  return { ok: true };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { emailNormalized: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const err: any = new Error("Pogresan email ili lozinka.");
    err.status = 401;
    throw err;
  }
  if (!user.emailVerifiedAt) {
    const err: any = new Error("Email nije verifikovan.");
    err.status = 403;
    throw err;
  }
  return {
    user: toPublicUser(user),
    access: signAccess({ id: user.id, role: user.role }),
    refresh: signRefresh({ id: user.id }),
  };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefresh(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    const err: any = new Error("Unauthenticated");
    err.status = 401;
    throw err;
  }
  return {
    user: toPublicUser(user),
    access: signAccess({ id: user.id, role: user.role }),
    refresh: signRefresh({ id: user.id }),
  };
}

export async function notifyNewQuizEmails(quizName: string, moduleName: string) {
  const recipients = await prisma.user.findMany({
    where: { role: "student", notifyNewQuiz: true, emailVerifiedAt: { not: null } },
    select: { email: true },
  });
  let sent = 0;
  for (const r of recipients) {
    try {
      await sendQuizPublishedEmail(r.email, quizName, moduleName);
      sent++;
    } catch {}
  }
  return { sent };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { emailNormalized: email.toLowerCase() } });
  // Always return the same shape — never reveal whether the email exists.
  if (!user) return { ok: true };
  const code = sixDigit();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetHash: hashCode(code), resetExpires: new Date(Date.now() + CODE_TTL_MS) },
  });
  try {
    await sendCodeEmail(user.email, code, "reset");
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetHash: null, resetExpires: null },
    });
  }
  return { ok: true };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { emailNormalized: email.toLowerCase() } });
  if (!user || !user.resetHash || !user.resetExpires) {
    const err: any = new Error("Neispravan kod.");
    err.status = 400;
    throw err;
  }
  if (user.resetExpires < new Date() || hashCode(code) !== user.resetHash) {
    const err: any = new Error("Neispravan ili istekao kod.");
    err.status = 400;
    throw err;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
      resetHash: null,
      resetExpires: null,
    },
  });
  return { ok: true };
}
