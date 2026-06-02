import { hasDatabaseConfig } from "@/lib/ensure-db-env";
import { NextResponse } from "next/server";

/** @deprecated Usar POST /api/ronda/iniciar — ya no expone respuestas correctas. */
export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  return NextResponse.json(
    {
      error: "Usa POST /api/ronda/iniciar para comenzar una ronda segura.",
      preguntas: [],
    },
    { status: 410 },
  );
}
