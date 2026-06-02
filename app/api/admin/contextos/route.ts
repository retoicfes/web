import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import {
  adminUnauthorizedResponse,
  isAdminAuthorized,
  normalizarMateriaAdmin,
  normalizarDificultad,
  type ContextoImportInput,
  validarPreguntaInput,
} from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  try {
    const body = (await req.json()) as ContextoImportInput;

    const materia = normalizarMateriaAdmin(body.materia);
    if (!materia) {
      return NextResponse.json({ error: "Materia inválida" }, { status: 400 });
    }
    if (!body.contenido?.trim()) {
      return NextResponse.json({ error: "El contexto necesita contenido" }, { status: 400 });
    }
    if (!body.preguntasItems?.length) {
      return NextResponse.json({ error: "Agrega al menos una pregunta" }, { status: 400 });
    }

    for (let i = 0; i < body.preguntasItems.length; i++) {
      const err = validarPreguntaInput(body.preguntasItems[i]);
      if (err) {
        return NextResponse.json({ error: `Pregunta ${i + 1}: ${err}` }, { status: 400 });
      }
    }

    const contexto = await prisma.contextoICFES.create({
      data: {
        materia,
        titulo: body.titulo?.trim() || null,
        contenido: body.contenido.trim(),
      },
    });

    const creadas = await prisma.$transaction(
      body.preguntasItems.map((p, idx) => {
        const orden = p.orden ?? idx + 1;
        return prisma.preguntaICFES.create({
          data: {
            materia,
            enunciado: p.enunciado.trim(),
            opcionA: p.opcionA.trim(),
            opcionB: p.opcionB.trim(),
            opcionC: p.opcionC.trim(),
            opcionD: p.opcionD.trim(),
            correcta: p.correcta.trim().toUpperCase(),
            explicacion: p.explicacion.trim(),
            dificultad: normalizarDificultad(p.dificultad),
            contextoId: contexto.id,
            ordenEnContexto: orden,
          },
          select: { id: true, enunciado: true, ordenEnContexto: true },
        });
      }),
    );

    return NextResponse.json({
      ok: true,
      contextoId: contexto.id,
      preguntas: creadas,
    });
  } catch (e) {
    console.error("[POST /api/admin/contextos]", e);
    return NextResponse.json({ error: "Error al guardar contexto" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ contextos: [] }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  const materia = req.nextUrl.searchParams.get("materia");

  try {
    const rows = await prisma.contextoICFES.findMany({
      where: materia ? { materia } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { preguntas: true } },
      },
    });

    return NextResponse.json({
      contextos: rows.map((c) => ({
        id: c.id,
        materia: c.materia,
        titulo: c.titulo,
        contenidoPreview: c.contenido.slice(0, 120),
        preguntas: c._count.preguntas,
        createdAt: c.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error al listar" }, { status: 500 });
  }
}
