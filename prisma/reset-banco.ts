/**
 * Vacía preguntas + contextos (y opcionalmente rankings) en Neon.
 *
 * Uso:
 *   pnpm exec tsx prisma/reset-banco.ts              # solo banco
 *   pnpm exec tsx prisma/reset-banco.ts --rankings   # banco + rankings
 */
import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const incluirRankings = process.argv.includes("--rankings");

async function main() {
  const delP = await prisma.preguntaICFES.deleteMany();
  const delC = await prisma.contextoICFES.deleteMany();
  console.log(`Eliminadas ${delP.count} preguntas y ${delC.count} contextos.`);

  if (incluirRankings) {
    const delR = await prisma.ranking.deleteMany();
    console.log(`Eliminados ${delR.count} registros de ranking.`);
  } else {
    console.log("Rankings intactos (usa --rankings para borrarlos también).");
  }

  console.log("Listo. Carga el nuevo banco en /admin/preguntas o import JSON.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
