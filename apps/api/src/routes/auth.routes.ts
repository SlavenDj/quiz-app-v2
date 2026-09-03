import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema, verifySchema } from "../../../packages/validation/src/index.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), asyncHandler(async (_req, res) => {
  res.status(501).json({ message: "TODO Phase 1: implement register service" });
}));

authRoutes.post("/verify-email", validate(verifySchema), asyncHandler(async (_req, res) => {
  res.status(501).json({ message: "TODO Phase 1" });
}));

authRoutes.post("/login", validate(loginSchema), asyncHandler(async (_req, res) => {
  res.status(501).json({ message: "TODO Phase 1" });
}));

authRoutes.post("/refresh", asyncHandler(async (_req, res) => {
  res.status(501).json({ message: "TODO Phase 1" });
}));

authRoutes.post("/logout", asyncHandler(async (_req, res) => {
  res.status(501).json({ message: "TODO Phase 1" });
}));
