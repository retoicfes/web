import type { Prisma, PrismaClient } from "@prisma/client";

/** Campos mínimos para identificar un estudiante en el ranking. */
export type EstudianteRanking = {
  apodo: string;
  departamento: string;
  municipio: string;
  colegio: string;
  codigoEstablecimiento: string | null;
};

export const RANKING_GROUP_BY_ESTUDIANTE = [
  "apodo",
  "departamento",
  "municipio",
  "colegio",
  "codigoEstablecimiento",
] as const;

export type RankingGroupByEstudiante = typeof RANKING_GROUP_BY_ESTUDIANTE[number];

export type MejorPuntajeRow = {
  apodo: string;
  departamento: string;
  municipio: string;
  colegio: string;
  codigoEstablecimiento: string | null;
  puntaje: number;
};

type GroupRow = {
  apodo: string;
  departamento: string;
  municipio: string;
  colegio: string;
  codigoEstablecimiento: string | null;
  _max: { puntaje: number | null };
};

export function mapGrupoAMejor(g: GroupRow): MejorPuntajeRow {
  return {
    apodo: g.apodo,
    departamento: g.departamento,
    municipio: g.municipio,
    colegio: g.colegio,
    codigoEstablecimiento: g.codigoEstablecimiento,
    puntaje: g._max.puntaje ?? 0,
  };
}

export function ordenarMejoresPuntajes(rows: MejorPuntajeRow[]): MejorPuntajeRow[] {
  return [...rows].sort((a, b) => b.puntaje - a.puntaje);
}

export async function contarEstudiantesUnicos(
  prisma: PrismaClient,
  where: Prisma.RankingWhereInput,
): Promise<number> {
  const grupos = await prisma.ranking.groupBy({
    by: [...RANKING_GROUP_BY_ESTUDIANTE],
    where,
  });
  return grupos.length;
}

export async function mejoresPorEstudiante(
  prisma: PrismaClient,
  where: Prisma.RankingWhereInput,
  limit: number,
): Promise<{ filas: MejorPuntajeRow[]; total: number }> {
  const grupos = await prisma.ranking.groupBy({
    by: [...RANKING_GROUP_BY_ESTUDIANTE],
    where,
    _max: { puntaje: true },
  });

  const ordenados = ordenarMejoresPuntajes(grupos.map(mapGrupoAMejor));
  return {
    total: ordenados.length,
    filas: ordenados.slice(0, limit),
  };
}

/** Promedio del mejor puntaje por estudiante, agrupado por colegio (ranking nacional). */
export async function topColegiosPorMejorEstudiante(
  prisma: PrismaClient,
  limit: number,
): Promise<{
  filas: {
    colegio: string;
    municipio: string;
    departamento: string;
    puntaje: number;
    jugadores: number;
  }[];
  total: number;
}> {
  const grupos = await prisma.ranking.groupBy({
    by: [...RANKING_GROUP_BY_ESTUDIANTE],
    _max: { puntaje: true },
  });

  type Acc = {
    departamento: string;
    municipio: string;
    colegio: string;
    suma: number;
    jugadores: number;
  };

  const porColegio = new Map<string, Acc>();

  for (const g of grupos) {
    const key = `${g.departamento}\0${g.municipio}\0${g.colegio}`;
    const prev = porColegio.get(key);
    const puntaje = g._max.puntaje ?? 0;
    if (prev) {
      prev.suma += puntaje;
      prev.jugadores += 1;
    } else {
      porColegio.set(key, {
        departamento: g.departamento,
        municipio: g.municipio,
        colegio: g.colegio,
        suma: puntaje,
        jugadores: 1,
      });
    }
  }

  const lista = [...porColegio.values()]
    .map((c) => ({
      departamento: c.departamento,
      municipio: c.municipio,
      colegio: c.colegio,
      puntaje: Math.round(c.suma / c.jugadores),
      jugadores: c.jugadores,
    }))
    .sort((a, b) => b.puntaje - a.puntaje);

  return {
    total: lista.length,
    filas: lista.slice(0, limit),
  };
}

export function whereEstudiante(e: EstudianteRanking): Prisma.RankingWhereInput {
  if (e.codigoEstablecimiento) {
    return {
      apodo: e.apodo,
      codigoEstablecimiento: e.codigoEstablecimiento,
    };
  }
  return {
    apodo: e.apodo,
    departamento: e.departamento,
    municipio: e.municipio,
    colegio: e.colegio,
  };
}

/** Guarda solo el mejor puntaje del estudiante; elimina intentos peores. */
export async function guardarMejorPuntaje(
  prisma: PrismaClient,
  data: Prisma.RankingCreateInput & { puntaje: number },
): Promise<{ id: string; actualizado: boolean; puntaje: number }> {
  const estudiante: EstudianteRanking = {
    apodo: data.apodo,
    departamento: data.departamento,
    municipio: data.municipio,
    colegio: data.colegio,
    codigoEstablecimiento:
      typeof data.codigoEstablecimiento === "string" ? data.codigoEstablecimiento : null,
  };

  const existentes = await prisma.ranking.findMany({
    where: whereEstudiante(estudiante),
    orderBy: { puntaje: "desc" },
  });

  if (existentes.length === 0) {
    const row = await prisma.ranking.create({ data });
    return { id: row.id, actualizado: true, puntaje: row.puntaje };
  }

  const mejor = existentes[0];
  const peoresIds = existentes.filter((r) => r.id !== mejor.id).map((r) => r.id);

  if (data.puntaje <= mejor.puntaje) {
    if (peoresIds.length > 0) {
      await prisma.ranking.deleteMany({ where: { id: { in: peoresIds } } });
    }
    return { id: mejor.id, actualizado: false, puntaje: mejor.puntaje };
  }

  if (peoresIds.length > 0) {
    await prisma.ranking.deleteMany({ where: { id: { in: [...peoresIds, mejor.id] } } });
  } else {
    await prisma.ranking.delete({ where: { id: mejor.id } });
  }

  const row = await prisma.ranking.create({ data });
  return { id: row.id, actualizado: true, puntaje: row.puntaje };
}
