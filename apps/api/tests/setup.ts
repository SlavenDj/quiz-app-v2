import { execSync } from "node:child_process";

process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.JWT_ACCESS_SECRET = "test-access-secret-1234567890";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-1234567890";

for (let i = 0; i < 10; i++) {
  try {
    execSync("npx prisma db push --accept-data-loss --skip-generate", {
      cwd: process.cwd(),
      stdio: i === 0 ? "inherit" : "pipe",
    });
    break;
  } catch (err) {
    if (i === 9) throw err;
    execSync("sleep 1");
  }
}
