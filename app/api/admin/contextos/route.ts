import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import {
  adminUnauthorizedResponse,
  isAdminAuthorized,
  normalizarMateriaAdmin,
  normalizarDificultad,
  parsearImportacionContextos,
  type ContextoImportInput,
} from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  try {
    const body = await req.json();
    let bloques: ContextoImportInput[];
    try {
      bloques = parsearImportacionContextos(body);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "JSON inválido";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const resultados = await prisma.$transaction(async (tx) => {
      const creados: {
        contextoId: string;
        materia: string;
        preguntas: number;
      }[] = [];

      for (const bloque of bloques) {
        const materia = normalizarMateriaAdmin(bloque.materia)!;

        const contexto = await tx.contextoICFES.create({
          data: {
            materia,
            titulo: bloque.titulo?.trim() || null,
            contenido: bloque.contenido.trim(),
          },
        });

        const preguntas = await Promise.all(
          bloque.preguntasItems.map((p, idx) => {
            const orden = p.orden ?? idx + 1;
            return tx.preguntaICFES.create({
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
              select: { id: true },
            });
          }),
        );

        creados.push({
          contextoId: contexto.id,
          materia,
          preguntas: preguntas.length,
        });
      }

      return creados;
    });

    return NextResponse.json({
      ok: true,
      importados: resultados.length,
      contextos: resultados,
      totalPreguntas: resultados.reduce((s, c) => s + c.preguntas, 0),
    });
  } catch (e) {
    console.error("[POST /api/admin/contextos]", e);
    const detail = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al guardar contexto", detail },
      { status: 500 },
    );
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
