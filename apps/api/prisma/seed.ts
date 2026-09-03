import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 12);
  const admin = await prisma.user.upsert({
    where: { emailNormalized: "admin@plusultra.ba" },
    update: {},
    create: {
      email: "admin@plusultra.ba",
      emailNormalized: "admin@plusultra.ba",
      passwordHash,
      firstName: "Admin",
      lastName: "PlusUltra",
      role: "admin",
      emailVerifiedAt: new Date(),
    },
  });
  const mod = await prisma.module.create({
    data: {
      name: "Modul 1",
      shortDesc: "Uvod",
      longDesc: "Uvodni modul",
      editionLabel: "2025/26",
      moduleNumber: 1,
      startAt: new Date(),
      endAt: new Date(Date.now() + 90 * 86400000),
      status: "InProgress",
    },
  });
  console.log({ admin: admin.email, module: mod.id });
}

main().finally(() => prisma.$disconnect());
