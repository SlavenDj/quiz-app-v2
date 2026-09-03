import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL ?? "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 60 }), authRoutes);
app.use("/api/me", meRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/uploads", express.static("public/uploads"));
app.use(errorHandler);

export default app;
