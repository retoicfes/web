import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { shuffleArray } from "@/lib/game";
import { AREAS_ICFES } from "@/lib/icfes-puntaje";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const PREGUNTAS_POR_AREA_RONDA = 2;

function seleccionarBalanceada(
  todas: Awaited<ReturnType<typeof prisma.preguntaICFES.findMany>>,
  limit: number,
) {
  const porArea = AREAS_ICFES.length * PREGUNTAS_POR_AREA_RONDA;
  if (limit >= porArea) {
    const seleccion: typeof todas = [];
    for (const area of AREAS_ICFES) {
      const delArea = todas.filter((p) => p.materia === area);
      seleccion.push(...shuffleArray(delArea).slice(0, PREGUNTAS_POR_AREA_RONDA));
    }
    return shuffleArray(seleccion).slice(0, limit);
  }
  return shuffleArray(todas).slice(0, limit);
}

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 10), 20);
  const materia = req.nextUrl.searchParams.get("materia");

  try {
    const todas = await prisma.preguntaICFES.findMany({
      where: materia ? { materia } : undefined,
      select: {
        id: true,
        materia: true,
        enunciado: true,
        opcionA: true,
        opcionB: true,
        opcionC: true,
        opcionD: true,
        correcta: true,
        explicacion: true,
      },
    });

    const mezcladas = materia
      ? shuffleArray(todas).slice(0, limit)
      : seleccionarBalanceada(todas, limit);

    return NextResponse.json({ preguntas: mezcladas });
  } catch {
    return NextResponse.json({ error: "Error al cargar preguntas" }, { status: 500 });
  }
}
