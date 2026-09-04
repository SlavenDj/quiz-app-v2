import { prisma } from "../lib/prisma.js";
import { httpError } from "./common.js";
import { refreshModuleStatuses } from "./modules.service.js";
import { deleteQuizCascade } from "./admin.quizzes.js";

export async function listModulesAdmin() {
  await refreshModuleStatuses();
  const modules = await prisma.module.findMany({
    include: { _count: { select: { quizzes: true } } },
    orderBy: { moduleNumber: "asc" },
  });
  return modules.map((m) => ({ ...m, totalQuizzes: m._count.quizzes }));
}

export async function createModule(data: {
  name: string;
  shortDesc: string;
  longDesc: string;
  editionLabel: string;
  moduleNumber: number;
  startAt: string;
  endAt: string;
}) {
  return prisma.module.create({
    data: {
      ...data,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      status: "Locked",
    },
  });
}

export async function updateModule(
  id: number,
  data: Partial<{ name: string; shortDesc: string; longDesc: string; editionLabel: string; moduleNumber: number; startAt: string; endAt: string; status: string }>
) {
  const mod = await prisma.module.findUnique({ where: { id } });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  if (data.status && !["Locked", "InProgress", "Finished"].includes(data.status)) {
    throw httpError(400, "Neispravan status.");
  }
  return prisma.module.update({
    where: { id },
    data: {
      ...data,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
    },
  });
}

export async function deleteModule(id: number) {
  const mod = await prisma.module.findUnique({
    where: { id },
    include: { quizzes: { select: { quizId: true } } },
  });
  if (!mod) throw httpError(404, "Modul nije pronadjen.");
  // Fully remove quizzes that live ONLY in this module; merely unlink shared ones.
  for (const { quizId } of mod.quizzes) {
    const links = await prisma.quizModule.count({ where: { quizId } });
    if (links <= 1) {
      await deleteQuizCascade(quizId);
    } else {
      await prisma.quizModule.deleteMany({ where: { quizId, moduleId: id } });
    }
  }
  await prisma.module.delete({ where: { id } });
  return { ok: true };
}
