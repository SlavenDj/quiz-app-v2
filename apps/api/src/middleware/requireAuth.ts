import type { NextFunction, Request, Response } from "express";
import { verifyAccess } from "../lib/jwt.js";

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken as string | undefined;
  if (!token) return res.status(401).json({ message: "Unauthenticated" });
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    return res.status(401).json({ message: "Session expired" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
