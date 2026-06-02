import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import type { OpcionLetra } from "@/lib/game";
import { calcularResultadoICFES } from "@/lib/icfes-puntaje";
import { PUNTAJE_GLOBAL_MAXIMO, PUNTAJE_GLOBAL_MINIMO } from "@/lib/icfes-puntaje-limits";
import { evaluarRespuestaRonda } from "@/lib/ronda-server";
import { rateLimit } from "@/lib/security/rate-limit";
import {
  crearTokenRanking,
  verificarTokenRonda,
  signingConfigured,
} from "@/lib/security/round-token";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MIN_MS_POR_PREGUNTA = 2_500;

type RespuestaInput = { preguntaId: string; letra: string | null };

function esLetraValida(v: string | null): v is OpcionLetra | null {
  if (v === null) return true;
  return ["A", "B", "C", "D"].includes(v.toUpperCase());
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  if (!signingConfigured()) {
    return NextResponse.json({ error: "Servidor sin ROUND_SIGNING_SECRET" }, { status: 503 });
  }

  const limited = rateLimit(req, "ronda:finalizar", 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const { token, respuestas } = body as {
      token?: string;
      respuestas?: RespuestaInput[];
    };

    if (!token || !Array.isArray(respuestas)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const ronda = verificarTokenRonda(token);
    if (!ronda) {
      return NextResponse.json({ error: "Ronda inválida o expirada" }, { status: 403 });
    }

    const idsEsperados = new Set(ronda.ids);
    if (respuestas.length !== ronda.ids.length) {
      return NextResponse.json({ error: "Cantidad de respuestas incorrecta" }, { status: 400 });
    }

    const vistos = new Set<string>();
    for (const r of respuestas) {
      if (!r.preguntaId || !idsEsperados.has(r.preguntaId) || vistos.has(r.preguntaId)) {
        return NextResponse.json({ error: "Respuestas no coinciden con la ronda" }, { status: 400 });
      }
      if (!esLetraValida(r.letra)) {
        return NextResponse.json({ error: "Letra inválida" }, { status: 400 });
      }
      vistos.add(r.preguntaId);
    }

    const duracionMin = ronda.ids.length * MIN_MS_POR_PREGUNTA;
    if (Date.now() - ronda.startedAt < duracionMin) {
      return NextResponse.json({ error: "Ronda completada demasiado rápido" }, { status: 400 });
    }

    const preguntas = await prisma.preguntaICFES.findMany({
      where: { id: { in: ronda.ids } },
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

    const porId = new Map(preguntas.map((p) => [p.id, p]));
    const detalle: {
      preguntaId: string;
      materia: string;
      correcta: boolean;
      explicacion: string;
    }[] = [];

    const paraCalculo: { materia: string; correcta: boolean }[] = [];

    for (const r of respuestas) {
      const p = porId.get(r.preguntaId);
      if (!p) {
        return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 400 });
      }
      const letra = r.letra?.toUpperCase() ?? null;
      const acerto = evaluarRespuestaRonda(p, ronda.shuffleSeed, letra);
      paraCalculo.push({ materia: p.materia, correcta: acerto });
      detalle.push({
        preguntaId: p.id,
        materia: p.materia,
        correcta: acerto,
        explicacion: p.explicacion,
      });
    }

    const resultado = calcularResultadoICFES(paraCalculo);
    const puntajeGlobal = Math.max(
      PUNTAJE_GLOBAL_MINIMO,
      Math.min(PUNTAJE_GLOBAL_MAXIMO, resultado.puntajeGlobal),
    );

    const rankingToken = crearTokenRanking(puntajeGlobal, ronda.n);

    return NextResponse.json({
      resultado: { ...resultado, puntajeGlobal },
      detalle,
      rankingToken,
    });
  } catch (e) {
    console.error("[POST /api/ronda/finalizar]", e);
    return NextResponse.json({ error: "Error al calificar ronda" }, { status: 500 });
  }
}
