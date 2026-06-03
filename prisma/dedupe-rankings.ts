/**
 * Deja una sola fila por estudiante (mejor puntaje). Ejecutar una vez si ya había duplicados.
 *
 * Uso: pnpm exec tsx prisma/dedupe-rankings.ts
 */
import "./load-env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function clave(row: {
  apodo: string;
  codigoEstablecimiento: string | null;
  departamento: string;
  municipio: string;
  colegio: string;
}) {
  return [
    row.apodo,
    row.codigoEstablecimiento ?? "",
    row.departamento,
    row.municipio,
    row.colegio,
  ].join("\0");
}

async function main() {
  const todas = await prisma.ranking.findMany();
  const mejorPorClave = new Map<string, (typeof todas)[0]>();

  for (const row of todas) {
    const key = clave(row);
    const prev = mejorPorClave.get(key);
    if (!prev || row.puntaje > prev.puntaje) {
      mejorPorClave.set(key, row);
    }
  }

  const idsMantener = new Set([...mejorPorClave.values()].map((r) => r.id));
  const idsBorrar = todas.filter((r) => !idsMantener.has(r.id)).map((r) => r.id);

  if (idsBorrar.length > 0) {
    await prisma.ranking.deleteMany({ where: { id: { in: idsBorrar } } });
  }

  console.log(
    `Dedupe listo: ${mejorPorClave.size} estudiantes únicos, ${idsBorrar.length} filas duplicadas eliminadas.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
