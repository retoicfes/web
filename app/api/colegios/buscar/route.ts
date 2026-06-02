import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ colegios: [] }, { status: 503 });
  }

  const daneMuni = req.nextUrl.searchParams.get("daneMuni");
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 25), 40);
  const soloActivos = req.nextUrl.searchParams.get("activos") !== "0";

  if (!daneMuni) {
    return NextResponse.json({ colegios: [] });
  }

  try {
    const rows = await prisma.establecimiento.findMany({
      where: {
        municipio: { codigoDane: daneMuni },
        ...(soloActivos ? { estado: { contains: "ACTIVO", mode: "insensitive" } } : {}),
        ...(q.length >= 2
          ? { nombre: { contains: q, mode: "insensitive" } }
          : {}),
      },
      orderBy: { nombre: "asc" },
      take: limit,
      select: {
        codigo: true,
        nombre: true,
        estado: true,
        municipio: {
          select: {
            nombre: true,
            codigoDane: true,
            departamento: { select: { nombre: true, codigoDane: true } },
          },
        },
        _count: { select: { sedes: true } },
      },
    });

    return NextResponse.json({
      colegios: rows.map((r) => ({
        codigo: r.codigo,
        nombre: r.nombre,
        estado: r.estado,
        sedes: r._count.sedes,
        municipio: r.municipio.nombre,
        departamento: r.municipio.departamento.nombre,
        daneMunicipio: r.municipio.codigoDane,
        daneDepartamento: r.municipio.departamento.codigoDane,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error en búsqueda" }, { status: 500 });
  }
}
