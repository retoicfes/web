import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { PREGUNTAS_POR_RONDA, shuffleArray } from "@/lib/game";
import { AREAS_ICFES } from "@/lib/icfes-puntaje";
import { publicarPreguntaRonda } from "@/lib/ronda-server";
import { rateLimit } from "@/lib/security/rate-limit";
import { crearTokenRonda, signingConfigured } from "@/lib/security/round-token";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";
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

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  if (!signingConfigured()) {
    return NextResponse.json(
      { error: "Servidor sin ROUND_SIGNING_SECRET configurado" },
      { status: 503 },
    );
  }

  const limited = rateLimit(req, "ronda:iniciar", 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { limit?: number };
    const limit = Math.min(Number(body.limit ?? PREGUNTAS_POR_RONDA), 20);

    const todas = await prisma.preguntaICFES.findMany({
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

    const seleccion = seleccionarBalanceada(todas, limit);
    if (!seleccion.length) {
      return NextResponse.json({ error: "Sin preguntas disponibles" }, { status: 503 });
    }

    const shuffleSeed = randomBytes(16).toString("hex");
    const token = crearTokenRonda(
      seleccion.map((p) => p.id),
      shuffleSeed,
    );

    return NextResponse.json({
      token,
      preguntas: seleccion.map((p) => publicarPreguntaRonda(p, shuffleSeed)),
    });
  } catch {
    return NextResponse.json({ error: "Error al iniciar ronda" }, { status: 500 });
  }
}
