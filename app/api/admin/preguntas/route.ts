import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import {
  adminUnauthorizedResponse,
  isAdminAuthorized,
  normalizarMateriaAdmin,
  normalizarDificultad,
  type PreguntaImportInput,
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
    const body = (await req.json()) as PreguntaImportInput & { materia: string };

    const materia = normalizarMateriaAdmin(body.materia);
    if (!materia) {
      return NextResponse.json({ error: "Materia inválida" }, { status: 400 });
    }

    const err = validarPreguntaInput(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const row = await prisma.preguntaICFES.create({
      data: {
        materia,
        enunciado: body.enunciado.trim(),
        opcionA: body.opcionA.trim(),
        opcionB: body.opcionB.trim(),
        opcionC: body.opcionC.trim(),
        opcionD: body.opcionD.trim(),
        correcta: body.correcta.trim().toUpperCase(),
        explicacion: body.explicacion.trim(),
        dificultad: normalizarDificultad(body.dificultad),
      },
      select: { id: true, materia: true, enunciado: true, dificultad: true },
    });

    return NextResponse.json({ ok: true, pregunta: row });
  } catch (e) {
    console.error("[POST /api/admin/preguntas]", e);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ preguntas: [], total: 0 }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  const materia = req.nextUrl.searchParams.get("materia");
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const take = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 100);

  try {
    const where = {
      ...(materia ? { materia } : {}),
      ...(q
        ? {
            enunciado: { contains: q, mode: "insensitive" as const },
          }
        : {}),
    };
    const [preguntas, total] = await Promise.all([
      prisma.preguntaICFES.findMany({
        where,
        orderBy: { id: "desc" },
        take,
        select: {
          id: true,
          materia: true,
          enunciado: true,
          correcta: true,
          dificultad: true,
          contextoId: true,
          ordenEnContexto: true,
          contexto: { select: { titulo: true } },
        },
      }),
      prisma.preguntaICFES.count({ where }),
    ]);

    return NextResponse.json({
      total,
      preguntas: preguntas.map((p) => ({
        id: p.id,
        materia: p.materia,
        enunciado: p.enunciado.slice(0, 100),
        correcta: p.correcta,
        dificultad: p.dificultad,
        contexto: p.contexto?.titulo ?? (p.contextoId ? "Con contexto" : null),
        orden: p.ordenEnContexto,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error al listar" }, { status: 500 });
  }
}
