import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { prisma } from "../lib/prisma.js";
import { toPublicUser } from "../services/auth.service.js";

export const meRoutes = Router();
meRoutes.use(requireAuth);

meRoutes.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user: toPublicUser(user) });
  })
);

meRoutes.patch(
  "/",
  validate(
    z.object({
      firstName: z.string().min(2).max(40).optional(),
      lastName: z.string().min(2).max(40).optional(),
      country: z.string().min(2).max(100).optional(),
      city: z.string().min(2).max(100).optional(),
      bio: z.string().max(500).optional(),
      nickname: z.string().max(20).optional(),
      username: z.string().max(30).optional(),
    })
  ),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: req.body });
    res.json({ user: toPublicUser(user) });
  })
);

meRoutes.put(
  "/password",
  validate(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(72) })),
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: "Trenutna lozinka nije tacna." });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(req.body.newPassword, 12) },
    });
    res.json({ ok: true });
  })
);

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Dozvoljeni su samo JPEG/PNG/WebP."));
  },
});

meRoutes.post(
  "/avatar",
  upload.single("image"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ message: "Nema slike." });
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (user?.avatarFile) {
      try {
        fs.unlinkSync(path.join(uploadDir, user.avatarFile));
      } catch {}
    }
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarFile: req.file.filename },
    });
    res.json({ user: toPublicUser(updated) });
  })
);

meRoutes.delete(
  "/avatar",
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (user?.avatarFile) {
      try {
        fs.unlinkSync(path.join(uploadDir, user.avatarFile));
      } catch {}
    }
    const updated = await prisma.user.update({ where: { id: req.user!.id }, data: { avatarFile: null } });
    res.json({ user: toPublicUser(updated) });
  })
);
