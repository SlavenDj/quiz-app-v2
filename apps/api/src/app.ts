import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { quizRoutes } from "./routes/quiz.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL ?? "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 60 }), authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", quizRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));
// Public images are embedded cross-origin (<img> from the web app origin),
// so CORP must allow it here (helmet defaults to same-origin, which would
// break every avatar/question image with a silent decode error).
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static("public/uploads"));
app.use(errorHandler);

export default app;
