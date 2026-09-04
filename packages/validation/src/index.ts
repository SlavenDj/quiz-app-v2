import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(8).max(72),
  country: z.string().min(2),
  city: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifySchema = z.object({
  userId: z.number().int().positive(),
  code: z.string().length(6),
});

export const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(72),
});

export const submitSchema = z.object({
  attemptId: z.number().int().positive(),
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answerIds: z.array(z.number().int().positive()).optional(),
      text: z.string().max(2000).optional(),
    })
  ),
});

const noScript = (s: string) => !/<script/i.test(s);

export const htmlString = (max: number) =>
  z.string().min(1).max(max).refine(noScript, "HTML ne smije sadrzavati script tag.");

/** For optional HTML fields where "" is a legal value (min must not reject the default). */
export const emptyableHtmlString = (max: number) =>
  z.string().max(max).refine(noScript, "HTML ne smije sadrzavati script tag.");

export const quizUpsertSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(2000),
  timeLimitSec: z.number().min(60).max(3600).default(600),
  maxAttempts: z.number().min(1).max(10).default(3),
});
