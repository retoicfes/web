import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import {
  adminUnauthorizedResponse,
  DIFICULTADES_PREGUNTA,
  isAdminAuthorized,
} from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function contarPorDificultad(): Promise<Record<string, number>> {
  const counts = await Promise.all(
    DIFICULTADES_PREGUNTA.map(async (dificultad) => ({
      dificultad,
      total: await prisma.preguntaICFES.count({ where: { dificultad } }),
    })),
  );
  return Object.fromEntries(counts.map(({ dificultad, total }) => [dificultad, total]));
}

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ materias: [] }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  try {
    const [grupos, contextos, porDificultad] = await Promise.all([
      prisma.preguntaICFES.groupBy({
        by: ["materia"],
        _count: { _all: true },
      }),
      prisma.contextoICFES.groupBy({
        by: ["materia"],
        _count: { _all: true },
      }),
      contarPorDificultad().catch((e) => {
        console.error("[GET /api/admin/stats] porDificultad:", e);
        return {} as Record<string, number>;
      }),
    ]);

    const ctxMap = new Map(contextos.map((c) => [c.materia, c._count._all]));

    return NextResponse.json({
      materias: grupos.map((g) => ({
        materia: g.materia,
        preguntas: g._count._all,
        contextos: ctxMap.get(g.materia) ?? 0,
      })),
      totalPreguntas: grupos.reduce((s, g) => s + g._count._all, 0),
      porDificultad,
    });
  } catch (e) {
    console.error("[GET /api/admin/stats]", e);
    return NextResponse.json({ error: "Error al obtener stats" }, { status: 500 });
  }
}
