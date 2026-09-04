import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import app from "../src/app.js";

const prisma = new PrismaClient();

const EMAIL = "authstudent@gmail.com";
const PASSWORD = "Password123";

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { emailNormalized: EMAIL } });
});

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

describe("auth", () => {
  it("register → verify → login → me roundtrip", async () => {
    const agent = request.agent(app);

    const reg = await agent.post("/api/auth/register").send({
      firstName: "Auth",
      lastName: "Student",
      email: EMAIL,
      password: PASSWORD,
      country: "BiH",
      city: "Sarajevo",
    });
    expect(reg.status).toBe(201);
    const userId = reg.body.userId as number;
    expect(userId).toBeGreaterThan(0);

    // Inject a known verification code directly in DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationHash: sha256("123456"),
        verificationExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const verify = await agent.post("/api/auth/verify-email").send({ userId, code: "123456" });
    expect(verify.status).toBe(200);

    const login = await agent.post("/api/auth/login").send({ email: EMAIL, password: PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.user.email.toLowerCase()).toBe(EMAIL);

    const me = await agent.get("/api/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email.toLowerCase()).toBe(EMAIL);
  });

  it("wrong password returns 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: EMAIL, password: "WrongPass999" });
    expect(res.status).toBe(401);
  });

  it("unauthenticated GET /api/me returns 401", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });

  it("student GET /api/admin/modules returns 403", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: EMAIL, password: PASSWORD });
    const res = await agent.get("/api/admin/modules");
    expect(res.status).toBe(403);
  });
});
