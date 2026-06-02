import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Diagnóstico rápido: GET /api/health */
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta DATABASE_URL (o POSTGRES_PRISMA_URL) en el entorno de Vercel",
      },
      { status: 503 },
    );
  }

  try {
    const [preguntas, rankings] = await Promise.all([
      prisma.preguntaICFES.count(),
      prisma.ranking.count(),
    ]);
    return NextResponse.json({
      ok: true,
      preguntas,
      rankings,
      database: "connected",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("[health]", message);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: "Ejecuta pnpm db:push contra esta misma base de datos",
      },
      { status: 500 },
    );
  }
}
