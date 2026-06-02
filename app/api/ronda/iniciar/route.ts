import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { PREGUNTAS_POR_RONDA } from "@/lib/game";
import { preguntaConContextoSelect } from "@/lib/pregunta-map";
import { seleccionarPreguntasRonda } from "@/lib/ronda-seleccion";
import { publicarPreguntaRonda } from "@/lib/ronda-server";
import { rateLimit } from "@/lib/security/rate-limit";
import { crearTokenRonda, signingConfigured } from "@/lib/security/round-token";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const preguntaRondaSelect = {
  ...preguntaConContextoSelect,
  correcta: true,
  explicacion: true,
} as const;

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
    const body = (await req.json().catch(() => ({}))) as {
      limit?: number;
      excludeIds?: string[];
    };
    const limit = Math.min(Number(body.limit ?? PREGUNTAS_POR_RONDA), 20);
    const excludeIds = Array.isArray(body.excludeIds)
      ? body.excludeIds.filter((id): id is string => typeof id === "string").slice(0, 30)
      : [];

    const todas = await prisma.preguntaICFES.findMany({
      select: preguntaRondaSelect,
    });

    const seleccion = seleccionarPreguntasRonda(todas, limit, excludeIds);
    if (!seleccion.length) {
      return NextResponse.json({ error: "Sin preguntas disponibles" }, { status: 503 });
    }

    const shuffleSeed = randomBytes(16).toString("hex");
    const token = crearTokenRonda(
      seleccion.map((p) => p.id),
      shuffleSeed,
    );

    return NextResponse.json(
      {
        token,
        preguntas: seleccion.map((p) => publicarPreguntaRonda(p, shuffleSeed)),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Error al iniciar ronda" }, { status: 500 });
  }
}
