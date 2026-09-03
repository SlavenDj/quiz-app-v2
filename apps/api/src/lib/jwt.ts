import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";

export function signAccess(payload: { id: number; role: string }) {
  return jwt.sign(payload, accessSecret, { expiresIn: "15m" });
}

export function signRefresh(payload: { id: number }) {
  return jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, accessSecret) as { id: number; role: string };
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, refreshSecret) as { id: number };
}
