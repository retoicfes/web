import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ municipios: [] }, { status: 503 });
  }

  const daneDepto = req.nextUrl.searchParams.get("daneDepto");
  if (!daneDepto) {
    return NextResponse.json({ municipios: [] });
  }

  try {
    const rows = await prisma.municipio.findMany({
      where: { departamento: { codigoDane: daneDepto } },
      orderBy: { nombre: "asc" },
      select: { codigoDane: true, nombre: true },
    });
    return NextResponse.json({ municipios: rows });
  } catch {
    return NextResponse.json({ error: "Error al cargar municipios" }, { status: 500 });
  }
}
