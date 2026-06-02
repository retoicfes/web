import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apodo, departamento, municipio, colegio, puntaje } = body;

    if (!apodo || !departamento || !municipio || !colegio || typeof puntaje !== "number") {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const row = await prisma.ranking.create({
      data: {
        apodo: String(apodo).slice(0, 24),
        departamento,
        municipio,
        colegio,
        puntaje: Math.max(0, Math.min(1000, Math.round(puntaje))),
      },
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el puntaje" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "colegio";
  const departamento = req.nextUrl.searchParams.get("departamento");
  const municipio = req.nextUrl.searchParams.get("municipio");
  const colegio = req.nextUrl.searchParams.get("colegio");

  if (!departamento) {
    return NextResponse.json({ ranking: [] });
  }

  try {
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
  } catch {
    return NextResponse.json({ error: "Error al cargar ranking" }, { status: 500 });
  }
}
