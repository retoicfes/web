import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { PUNTAJE_GLOBAL_MAXIMO, PUNTAJE_GLOBAL_MINIMO } from "@/lib/icfes-puntaje-limits";
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

    const row = await prisma.ranking.create({
      data: {
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
      },
    });

    return NextResponse.json({ ok: true, id: row.id });
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

  try {
    if (scope === "nacional") {
      const grupos = await prisma.ranking.groupBy({
        by: ["departamento", "municipio", "colegio"],
        _avg: { puntaje: true },
        _count: { _all: true },
        orderBy: { _avg: { puntaje: "desc" } },
        take: 50,
      });

      return NextResponse.json({
        ranking: grupos.map((g) => ({
          apodo: g.colegio,
          colegio: g.colegio,
          municipio: g.municipio,
          departamento: g.departamento,
          puntaje: Math.round(g._avg.puntaje ?? 0),
          jugadores: g._count._all,
        })),
      });
    }

    if (!departamento) {
      return NextResponse.json({ ranking: [] });
    }

    if (scope === "departamento") {
      const rows = await prisma.ranking.findMany({
        where: { departamento },
        orderBy: { puntaje: "desc" },
        take: 50,
      });
      return NextResponse.json({
        ranking: rows.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
          departamento: r.departamento,
          municipio: r.municipio,
          colegio: r.colegio,
        })),
      });
    }

    if (scope === "municipio" && municipio) {
      const rows = await prisma.ranking.findMany({
        where: { departamento, municipio },
        orderBy: { puntaje: "desc" },
        take: 50,
      });
      return NextResponse.json({
        ranking: rows.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
          municipio: r.municipio,
          colegio: r.colegio,
        })),
      });
    }

    if (scope === "colegio" && municipio && colegio) {
      const rows = await prisma.ranking.findMany({
        where: { departamento, municipio, colegio },
        orderBy: { puntaje: "desc" },
        take: 30,
      });

      const promedio =
        rows.length > 0
          ? Math.round(rows.reduce((s, r) => s + r.puntaje, 0) / rows.length)
          : 0;

      return NextResponse.json({
        ranking: rows.map((r) => ({
          apodo: r.apodo,
          puntaje: r.puntaje,
        })),
        promedioColegio: promedio,
      });
    }

    return NextResponse.json({ ranking: [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("[GET /api/rankings]", message);
    return NextResponse.json({ error: "Error al cargar ranking", detail: message }, { status: 500 });
  }
}
