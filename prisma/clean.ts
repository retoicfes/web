import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rankings = await prisma.ranking.deleteMany();
  const preguntas = await prisma.preguntaICFES.deleteMany();
  console.log(`Limpieza: ${rankings.count} rankings y ${preguntas.count} preguntas eliminados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
