import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { submitSchema } from "validation";
import * as quiz from "../services/quiz.service.js";

export const quizRoutes = Router();
quizRoutes.use(requireAuth);

const idParam = z.object({ id: z.coerce.number().int().positive() });

quizRoutes.get(
  "/modules",
  asyncHandler(async (req, res) => {
    res.json(await quiz.listModules(req.query.edition as string | undefined));
  })
);

quizRoutes.get(
  "/modules/:id",
  validate(idParam, "params"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await quiz.getModuleDetail(Number(req.params.id), req.user!.id));
  })
);

quizRoutes.get(
  "/modules/:id/quizzes",
  validate(idParam, "params"),
  asyncHandler(async (req: AuthRequest, res) => {
    const detail = await quiz.getModuleDetail(Number(req.params.id), req.user!.id);
    res.json(detail.quizzes);
  })
);

quizRoutes.get(
  "/quizzes/:id",
  validate(idParam, "params"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await quiz.getQuizMeta(Number(req.params.id), req.user!.id));
  })
);

quizRoutes.post(
  "/quizzes/:id/play",
  validate(idParam, "params"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.status(201).json(await quiz.startOrResumePlay(Number(req.params.id), req.user!.id));
  })
);

quizRoutes.post(
  "/quizzes/:id/submit",
  validate(idParam, "params"),
  validate(submitSchema.extend({ attemptId: z.number() })),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(
      await quiz.submitAttempt(Number(req.params.id), req.user!.id, req.body.attemptId, req.body.answers)
    );
  })
);

quizRoutes.get(
  "/attempts/:id",
  validate(idParam, "params"),
  asyncHandler(async (req: AuthRequest, res) => {
    res.json(await quiz.getAttemptReview(Number(req.params.id), req.user!.id));
  })
);

quizRoutes.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    res.json(await quiz.getLeaderboard(Number.isFinite(limit) ? limit : 50));
  })
);
