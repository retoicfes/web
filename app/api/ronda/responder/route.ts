import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { evaluarRespuestaRonda } from "@/lib/ronda-server";
import { rateLimit } from "@/lib/security/rate-limit";
import { verificarTokenRonda, signingConfigured } from "@/lib/security/round-token";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  if (!signingConfigured()) {
    return NextResponse.json({ error: "Servidor sin ROUND_SIGNING_SECRET" }, { status: 503 });
  }

  const limited = rateLimit(req, "ronda:responder", 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const { token, preguntaId, letra } = body as {
      token?: string;
      preguntaId?: string;
      letra?: string | null;
    };

    if (!token || !preguntaId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const ronda = verificarTokenRonda(token);
    if (!ronda || !ronda.ids.includes(preguntaId)) {
      return NextResponse.json({ error: "Ronda inválida" }, { status: 403 });
    }

    const letraNorm = letra?.toUpperCase() ?? null;
    if (letraNorm !== null && !["A", "B", "C", "D"].includes(letraNorm)) {
      return NextResponse.json({ error: "Letra inválida" }, { status: 400 });
    }

    const pregunta = await prisma.preguntaICFES.findUnique({
      where: { id: preguntaId },
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

    if (!pregunta) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    const correcto = evaluarRespuestaRonda(pregunta, ronda.shuffleSeed, letraNorm);

    return NextResponse.json({
      correcto,
      explicacion: pregunta.explicacion,
    });
  } catch {
    return NextResponse.json({ error: "Error al verificar respuesta" }, { status: 500 });
  }
}
