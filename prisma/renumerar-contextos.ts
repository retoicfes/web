/**
 * Renumera ordenEnContexto a 1, 2, 3… dentro de cada contexto (por orden actual).
 *
 * Uso: pnpm db:renumerar-contextos
 */
import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const contextos = await prisma.contextoICFES.findMany({
    select: { id: true, titulo: true },
  });

  let actualizadas = 0;

  for (const ctx of contextos) {
    const preguntas = await prisma.preguntaICFES.findMany({
      where: { contextoId: ctx.id },
      orderBy: [{ ordenEnContexto: "asc" }, { id: "asc" }],
      select: { id: true, ordenEnContexto: true },
    });

    for (let i = 0; i < preguntas.length; i++) {
      const nuevo = i + 1;
      if (preguntas[i].ordenEnContexto !== nuevo) {
        await prisma.preguntaICFES.update({
          where: { id: preguntas[i].id },
          data: { ordenEnContexto: nuevo },
        });
        actualizadas += 1;
      }
    }
  }

  console.log(
    `Listo: ${contextos.length} contextos revisados, ${actualizadas} preguntas renumeradas (1…n por bloque).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
