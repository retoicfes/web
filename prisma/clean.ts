import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rankings = await prisma.ranking.deleteMany();
  const preguntas = await prisma.preguntaICFES.deleteMany();
  const contextos = await prisma.contextoICFES.deleteMany();
  console.log(
    `Limpieza: ${rankings.count} rankings, ${preguntas.count} preguntas, ${contextos.count} contextos.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
