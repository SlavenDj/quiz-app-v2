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
  userId: z.number(),
  code: z.string().length(6),
});

export const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number(),
      answerIds: z.array(z.number()).optional(),
      text: z.string().max(2000).optional(),
    })
  ),
});

export const quizUpsertSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(2000),
  timeLimitSec: z.number().min(60).max(3600).default(600),
  maxAttempts: z.number().min(1).max(10).default(3),
});
