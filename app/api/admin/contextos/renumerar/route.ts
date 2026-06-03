import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { adminUnauthorizedResponse, isAdminAuthorized } from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  try {
    const contextos = await prisma.contextoICFES.findMany({ select: { id: true } });
    let actualizadas = 0;

    for (const ctx of contextos) {
      const preguntas = await prisma.preguntaICFES.findMany({
        where: { contextoId: ctx.id },
        orderBy: [{ ordenEnContexto: "asc" }, { id: "asc" }],
        select: { id: true, ordenEnContexto: true },
      });

      for (let i = 0; i < preguntas.length; i++) {
        const nuevo = i + 1;
        if (preguntas[i].ordenEnContexto !== nuevo) {
          await prisma.preguntaICFES.update({
            where: { id: preguntas[i].id },
            data: { ordenEnContexto: nuevo },
          });
          actualizadas += 1;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      contextos: contextos.length,
      preguntasActualizadas: actualizadas,
    });
  } catch (e) {
    console.error("[POST /api/admin/contextos/renumerar]", e);
    return NextResponse.json({ error: "Error al renumerar" }, { status: 500 });
  }
}
