import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ departamentos: [] }, { status: 503 });
  }

  try {
    const rows = await prisma.departamento.findMany({
      orderBy: { nombre: "asc" },
      select: { codigoDane: true, nombre: true },
    });
    return NextResponse.json({ departamentos: rows });
  } catch {
    return NextResponse.json({ error: "Error al cargar departamentos" }, { status: 500 });
  }
}
