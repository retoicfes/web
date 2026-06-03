import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { adminUnauthorizedResponse, isAdminAuthorized } from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const CONFIRM = {
  preguntas: "BORRAR-PREGUNTAS",
  rankings: "BORRAR-RANKINGS",
  todo: "BORRAR-TODO",
} as const;

type Target = keyof typeof CONFIRM;

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  try {
    const body = (await req.json()) as { target?: string; confirm?: string };
    const target = body.target as Target | undefined;
    const confirm = body.confirm?.trim();

    if (!target || !(target in CONFIRM)) {
      return NextResponse.json(
        { error: "target debe ser: preguntas, rankings o todo" },
        { status: 400 },
      );
    }

    if (confirm !== CONFIRM[target]) {
      return NextResponse.json(
        {
          error: `Escribe confirm exacto: ${CONFIRM[target]}`,
          confirmRequired: CONFIRM[target],
        },
        { status: 400 },
      );
    }

    let preguntas = 0;
    let contextos = 0;
    let rankings = 0;

    if (target === "preguntas" || target === "todo") {
      const delP = await prisma.preguntaICFES.deleteMany();
      const delC = await prisma.contextoICFES.deleteMany();
      preguntas = delP.count;
      contextos = delC.count;
    }

    if (target === "rankings" || target === "todo") {
      const delR = await prisma.ranking.deleteMany();
      rankings = delR.count;
    }

    return NextResponse.json({
      ok: true,
      target,
      eliminados: { preguntas, contextos, rankings },
      mensaje:
        target === "preguntas"
          ? "Banco vacío. Sube el nuevo banco desde /admin/preguntas."
          : target === "rankings"
            ? "Rankings vacíos. Los estudiantes empiezan de cero en el servidor."
            : "Banco y rankings reiniciados.",
    });
  } catch (e) {
    console.error("[POST /api/admin/reset]", e);
    return NextResponse.json({ error: "Error al resetear" }, { status: 500 });
  }
}
