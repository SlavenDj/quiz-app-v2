import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let status = err.status ?? 500;
  let message = err.message ?? "Internal error";
  if (err?.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Slika je prevelika (max 5MB)." : "Neispravan upload.";
  }
  if (process.env.NODE_ENV !== "production") console.error(err);
  res.status(status).json({ message });
}
