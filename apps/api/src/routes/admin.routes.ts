import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import * as admin from "../services/admin.service.js";
import { htmlString, emptyableHtmlString } from "validation";
import { UPLOAD_DIR } from "../services/admin.service.js";
import { cleanupUploadedFile, imageFileFilter, imageFilename } from "../lib/upload.js";

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireRole("admin"));

const idParam = (name = "id") => z.object({ [name]: z.coerce.number().int().positive() });

// ---- Modules ----
adminRoutes.get("/modules", asyncHandler(async (_req, res) => {
  res.json(await admin.listModulesAdmin());
}));

const datetime = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Neispravan datum.");
const moduleBody = {
  name: z.string().min(3).max(120),
  shortDesc: z.string().min(1),
  longDesc: z.string().min(1),
  editionLabel: z.string().min(1),
  moduleNumber: z.number().int().min(1),
  startAt: datetime,
  endAt: datetime,
};

adminRoutes.post(
  "/modules",
  validate(z.object(moduleBody)),
  asyncHandler(async (req, res) => {
    res.status(201).json(await admin.createModule(req.body));
  })
);

adminRoutes.put(
  "/modules/:id",
  validate(idParam(), "params"),
  validate(
    z.object({
      name: z.string().min(3).max(120).optional(),
      shortDesc: z.string().optional(),
      longDesc: z.string().optional(),
      editionLabel: z.string().optional(),
      moduleNumber: z.number().int().min(1).optional(),
      startAt: datetime.optional(),
      endAt: datetime.optional(),
      status: z.string().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    res.json(await admin.updateModule(Number(req.params.id), req.body));
  })
);

adminRoutes.delete(
  "/modules/:id",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.deleteModule(Number(req.params.id)));
  })
);

// ---- Quizzes ----
adminRoutes.get(
  "/quizzes/:id",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.getQuizDetail(Number(req.params.id)));
  })
);

adminRoutes.post(
  "/modules/:id/quizzes",
  validate(idParam(), "params"),
  validate(
    z.object({
      name: z.string().min(3).max(120),
      description: z.string().max(2000).default(""),
      introHtml: emptyableHtmlString(20000).default(""),
      timeLimitSec: z.number().min(60).max(3600).default(600),
      maxAttempts: z.number().min(1).max(10).default(3),
      passPct: z.number().min(0).max(100).default(50),
    })
  ),
  asyncHandler(async (req, res) => {
    res.status(201).json(await admin.createQuiz(Number(req.params.id), req.body));
  })
);

adminRoutes.put(
  "/quizzes/:id",
  validate(idParam(), "params"),
  validate(
    z.object({
      name: z.string().min(3).max(120).optional(),
      description: z.string().max(2000).optional(),
      introHtml: emptyableHtmlString(20000).optional(),
      timeLimitSec: z.number().min(60).max(3600).optional(),
      maxAttempts: z.number().min(1).max(10).optional(),
      passPct: z.number().min(0).max(100).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    res.json(await admin.updateQuiz(Number(req.params.id), req.body));
  })
);

adminRoutes.delete(
  "/quizzes/:id",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.deleteQuiz(Number(req.params.id)));
  })
);

// ---- Questions ----
adminRoutes.post(
  "/quizzes/:id/questions",
  validate(idParam(), "params"),
  validate(
    z.object({
      bodyHtml: htmlString(20000),
      type: z.enum(["single", "multiple", "text"]),
      expectedText: z.string().max(500).optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    res.status(201).json(await admin.addQuestion(Number(req.params.id), req.body));
  })
);

adminRoutes.put(
  "/questions/:id",
  validate(idParam(), "params"),
  validate(
    z.object({
      bodyHtml: htmlString(20000).optional(),
      type: z.enum(["single", "multiple", "text"]).optional(),
      expectedText: z.string().max(500).nullable().optional(),
    })
  ),
  asyncHandler(async (req, res) => {
    res.json(await admin.updateQuestion(Number(req.params.id), req.body));
  })
);

adminRoutes.delete(
  "/questions/:id",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.deleteQuestion(Number(req.params.id)));
  })
);

// ---- Answers ----
adminRoutes.post(
  "/questions/:id/answers",
  validate(idParam(), "params"),
  validate(z.object({ body: z.string().min(1), isCorrect: z.boolean().default(false) })),
  asyncHandler(async (req, res) => {
    res.status(201).json(await admin.addAnswer(Number(req.params.id), req.body));
  })
);

adminRoutes.put(
  "/answers/:id",
  validate(idParam(), "params"),
  validate(z.object({ body: z.string().min(1).optional(), isCorrect: z.boolean().optional() })),
  asyncHandler(async (req, res) => {
    res.json(await admin.updateAnswer(Number(req.params.id), req.body));
  })
);

adminRoutes.delete(
  "/answers/:id",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.deleteAnswer(Number(req.params.id)));
  })
);

// ---- Question image ----
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: imageFilename,
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

adminRoutes.post(
  "/questions/:id/image",
  validate(idParam(), "params"),
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Nema slike." });
      res.json(await admin.setQuestionImage(Number(req.params.id), req.file.filename));
    } catch (e) {
      cleanupUploadedFile(req);
      throw e;
    }
  })
);

adminRoutes.delete(
  "/questions/:id/image",
  validate(idParam(), "params"),
  asyncHandler(async (req, res) => {
    res.json(await admin.deleteQuestionImage(Number(req.params.id)));
  })
);
