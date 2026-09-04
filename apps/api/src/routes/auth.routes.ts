import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema, resetSchema, verifySchema } from "validation";
import { clearAuthCookies, setAuthCookies } from "../lib/cookies.js";
import * as auth from "../services/auth.service.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await auth.register(req.body));
  })
);

authRoutes.post(
  "/verify-email",
  validate(verifySchema),
  asyncHandler(async (req, res) => {
    res.json(await auth.verifyEmail(req.body.userId, req.body.code));
  })
);

authRoutes.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await auth.login(req.body.email, req.body.password);
    setAuthCookies(res, result.access, result.refresh);
    res.json({ user: result.user });
  })
);

authRoutes.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) return res.status(401).json({ message: "Unauthenticated" });
    try {
      const result = await auth.refresh(token);
      setAuthCookies(res, result.access, result.refresh);
      res.json({ user: result.user });
    } catch {
      return res.status(401).json({ message: "Session expired" });
    }
  })
);

authRoutes.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    clearAuthCookies(res);
    res.json({ ok: true });
  })
);

authRoutes.post(
  "/forgot",
  validate(z.object({ email: z.string().email() })),
  asyncHandler(async (req, res) => {
    res.json(await auth.forgotPassword(req.body.email));
  })
);

authRoutes.post(
  "/reset",
  validate(resetSchema),
  asyncHandler(async (req, res) => {
    res.json(await auth.resetPassword(req.body.email, req.body.code, req.body.newPassword));
  })
);
