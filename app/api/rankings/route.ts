import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { PUNTAJE_GLOBAL_MAXIMO, PUNTAJE_GLOBAL_MINIMO } from "@/lib/icfes-puntaje-limits";
import {
  guardarMejorPuntaje,
  mejoresPorEstudiante,
  topColegiosPorMejorEstudiante,
} from "@/lib/ranking-best";
import { limiteRanking } from "@/lib/ranking-config";
import { rateLimit, sanitizeApodo, sanitizeTexto } from "@/lib/security/rate-limit";
import { verificarTokenRanking, signingConfigured } from "@/lib/security/round-token";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: "Base de datos no configurada en el servidor" },
      { status: 503 },
    );
  }

  const limited = rateLimit(req, "rankings:post", 15, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const body = await req.json();
    const {
      apodo,
      departamento,
      municipio,
      colegio,
      puntaje,
      daneDepartamento,
      daneMunicipio,
      codigoEstablecimiento,
      rankingToken,
    } = body;

    if (!apodo || !departamento || !municipio || !colegio || typeof puntaje !== "number") {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const puntajeRedondeado = Math.round(puntaje);
    if (
      puntajeRedondeado < PUNTAJE_GLOBAL_MINIMO ||
      puntajeRedondeado > PUNTAJE_GLOBAL_MAXIMO
    ) {
      return NextResponse.json({ error: "Puntaje fuera de rango" }, { status: 400 });
    }

    if (!signingConfigured() || typeof rankingToken !== "string") {
      return NextResponse.json(
        { error: "Token de ronda requerido. Completa el juego normalmente." },
        { status: 403 },
      );
    }

    if (!verificarTokenRanking(rankingToken, puntajeRedondeado)) {
      return NextResponse.json({ error: "Token de puntaje inválido o expirado" }, { status: 403 });
    }

    if (
      codigoEstablecimiento &&
      daneMunicipio &&
      !(await colegioValido(String(codigoEstablecimiento), String(daneMunicipio)))
    ) {
      return NextResponse.json({ error: "Colegio no válido" }, { status: 400 });
    }

    const resultado = await guardarMejorPuntaje(prisma, {
      apodo: sanitizeApodo(apodo),
      departamento: sanitizeTexto(departamento, 120),
      municipio: sanitizeTexto(municipio, 120),
      colegio: sanitizeTexto(colegio, 500),
      daneDepartamento: daneDepartamento ? sanitizeTexto(daneDepartamento, 10) : null,
      daneMunicipio: daneMunicipio ? sanitizeTexto(daneMunicipio, 10) : null,
      codigoEstablecimiento: codigoEstablecimiento
        ? sanitizeTexto(codigoEstablecimiento, 20)
        : null,
      puntaje: puntajeRedondeado,
    });

    return NextResponse.json({
      ok: true,
      id: resultado.id,
      puntajeGuardado: resultado.puntaje,
      /** false si el intento no superó el récord previo */
      superoAnterior: resultado.actualizado,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("[POST /api/rankings]", message);
    return NextResponse.json(
      { error: "No se pudo guardar el puntaje", detail: message },
      { status: 500 },
    );
  }
}

async function colegioValido(codigo: string, daneMuni: string): Promise<boolean> {
  const count = await prisma.establecimiento.count({
    where: {
      codigo,
      municipio: { codigoDane: daneMuni },
    },
  });
  return count > 0;
}

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ ranking: [], error: "DB no configurada" }, { status: 503 });
  }

  const scope = req.nextUrl.searchParams.get("scope") ?? "colegio";
  const departamento = req.nextUrl.searchParams.get("departamento");
  const municipio = req.nextUrl.searchParams.get("municipio");
  const colegio = req.nextUrl.searchParams.get("colegio");
  const limit = limiteRanking(scope);

  try {
    if (scope === "nacional") {
      const { filas, total } = await topColegiosPorMejorEstudiante(prisma, limit);

      return NextResponse.json({
        scope,
        limit,
        total,
        deduplicado: true,
        ranking: filas.map((g) => ({
          apodo: g.colegio,
          colegio: g.colegio,
          municipio: g.municipio,
          departamento: g.departamento,
          puntaje: g.puntaje,
          jugadores: g.jugadores,
        })),
      });
    }

    if (!departamento) {
      return NextResponse.json({ ranking: [], limit, total: 0, scope, deduplicado: true });
    }

    if (scope === "departamento") {
      const { filas, total } = await mejoresPorEstudiante(prisma, { departamento }, limit);
      return NextResponse.json({
        scope,
        limit,
        total,
        deduplicado: true,
        ranking: filas.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
          departamento: r.departamento,
          municipio: r.municipio,
          colegio: r.colegio,
        })),
      });
    }

    if (scope === "municipio" && municipio) {
      const { filas, total } = await mejoresPorEstudiante(
        prisma,
        { departamento, municipio },
        limit,
      );
      return NextResponse.json({
        scope,
        limit,
        total,
        deduplicado: true,
        ranking: filas.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
          municipio: r.municipio,
          colegio: r.colegio,
        })),
      });
    }

    if (scope === "colegio" && municipio && colegio) {
      const { filas, total } = await mejoresPorEstudiante(
        prisma,
        { departamento, municipio, colegio },
        limit,
      );

      const promedio =
        filas.length > 0
          ? Math.round(filas.reduce((s, r) => s + r.puntaje, 0) / filas.length)
          : 0;

      return NextResponse.json({
        scope,
        limit,
        total,
        deduplicado: true,
        ranking: filas.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
        })),
        promedioColegio: promedio,
      });
    }

    return NextResponse.json({ ranking: [], limit, total: 0, scope, deduplicado: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("[GET /api/rankings]", message);
    return NextResponse.json({ error: "Error al cargar ranking", detail: message }, { status: 500 });
  }
}
