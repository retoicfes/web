import { PREGUNTAS_SABER_11 } from "../data/preguntas-saber11";
import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ranking.deleteMany();
  await prisma.preguntaICFES.deleteMany();
  await prisma.preguntaICFES.createMany({ data: PREGUNTAS_SABER_11 });

  const porMateria = PREGUNTAS_SABER_11.reduce(
    (acc, p) => {
      acc[p.materia] = (acc[p.materia] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(`Seed: ${PREGUNTAS_SABER_11.length} preguntas Saber 11 (grado 11°).`);
  console.log("Por materia:", porMateria);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
