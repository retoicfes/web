import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import {
  adminUnauthorizedResponse,
  isAdminAuthorized,
  normalizarDificultad,
  normalizarMateriaAdmin,
  type PreguntaImportInput,
  validarPreguntaInput,
} from "@/lib/admin/preguntas";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const preguntaDetalleSelect = {
  id: true,
  materia: true,
  enunciado: true,
  opcionA: true,
  opcionB: true,
  opcionC: true,
  opcionD: true,
  correcta: true,
  explicacion: true,
  dificultad: true,
  contextoId: true,
  ordenEnContexto: true,
  contexto: {
    select: { id: true, titulo: true, contenido: true, materia: true },
  },
} as const;

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  const { id } = await ctx.params;

  try {
    const p = await prisma.preguntaICFES.findUnique({
      where: { id },
      select: preguntaDetalleSelect,
    });

    if (!p) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ pregunta: p });
  } catch {
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "DB no configurada" }, { status: 503 });
  }
  if (!isAdminAuthorized(req)) return adminUnauthorizedResponse();

  const { id } = await ctx.params;

  try {
    const body = (await req.json()) as PreguntaImportInput & {
      materia?: string;
      ordenEnContexto?: number | null;
    };

    const existente = await prisma.preguntaICFES.findUnique({
      where: { id },
      select: { id: true, materia: true },
    });
    if (!existente) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    const materiaRaw = body.materia ?? existente.materia;
    const materia = normalizarMateriaAdmin(materiaRaw);
    if (!materia) {
      return NextResponse.json({ error: "Materia inválida" }, { status: 400 });
    }

    const err = validarPreguntaInput(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const orden =
      body.ordenEnContexto ?? body.orden ?? undefined;

    const actualizada = await prisma.preguntaICFES.update({
      where: { id },
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
        ...(orden !== undefined
          ? { ordenEnContexto: orden === null ? null : Number(orden) }
          : {}),
      },
      select: preguntaDetalleSelect,
    });

    return NextResponse.json({ ok: true, pregunta: actualizada });
  } catch (e) {
    console.error("[PATCH /api/admin/preguntas/[id]]", e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
