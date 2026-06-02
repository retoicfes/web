import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { shuffleArray } from "@/lib/game";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const mezcladas = shuffleArray(todas).slice(0, limit);

    return NextResponse.json({ preguntas: mezcladas });
  } catch {
    return NextResponse.json({ error: "Error al cargar preguntas" }, { status: 500 });
  }
}
