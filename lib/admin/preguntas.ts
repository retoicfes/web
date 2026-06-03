import { AREAS_ICFES, type AreaICFES } from "@/lib/icfes-puntaje";
import type { NextRequest } from "next/server";

export type ContextoDTO = {
  id: string;
  titulo: string | null;
  contenido: string;
};

export type PreguntaConContexto = {
  id: string;
  materia: string;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  contexto?: ContextoDTO | null;
  ordenEnContexto?: number | null;
};

/** Solo local / con ADMIN_SECRET. En producción sin secret, admin bloqueado. */
export function isAdminAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("x-admin-key")?.trim();
  const query = req.nextUrl.searchParams.get("key")?.trim();
  return header === secret || query === secret;
}

export function adminUnauthorizedResponse() {
  return Response.json({ error: "No autorizado" }, { status: 401 });
}

export function normalizarMateriaAdmin(raw: string | undefined | null): AreaICFES | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().toLowerCase();
  return AREAS_ICFES.find((a) => a.toLowerCase() === t) ?? null;
}

export const DIFICULTADES_PREGUNTA = ["facil", "media", "dificil"] as const;

export type DificultadPregunta = (typeof DIFICULTADES_PREGUNTA)[number];

export const DIFICULTAD_DEFAULT: DificultadPregunta = "media";

export const ETIQUETA_DIFICULTAD: Record<DificultadPregunta, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
};

export function normalizarDificultad(raw: string | undefined | null): DificultadPregunta {
  if (!raw) return DIFICULTAD_DEFAULT;
  const t = raw.trim().toLowerCase();
  if (t === "facil" || t === "fácil" || t === "easy" || t === "baja") return "facil";
  if (t === "media" || t === "medio" || t === "intermedia" || t === "medium") return "media";
  if (t === "dificil" || t === "difícil" || t === "hard" || t === "alta") return "dificil";
  return DIFICULTAD_DEFAULT;
}

export type PreguntaImportInput = {
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  correcta: string;
  explicacion: string;
  /** Etiqueta interna; no altera puntaje. Default: media. */
  dificultad?: DificultadPregunta | string;
  /** Número de ítem dentro del contexto (1, 2, 3…). */
  orden?: number;
};

export type ContextoImportInput = {
  materia: string;
  titulo?: string;
  contenido: string;
  /** Si se omite, aplica a todas las preguntas del bloque. */
  preguntas?: number[];
  preguntasItems: PreguntaImportInput[];
};

/** Acepta un contexto `{ materia, contenido, preguntasItems }` o un arreglo de varios. */
export function parsearImportacionContextos(raw: unknown): ContextoImportInput[] {
  const lista = Array.isArray(raw)
    ? raw
    : raw !== null && typeof raw === "object"
      ? [raw]
      : [];

  if (lista.length === 0) {
    throw new Error(
      "Formato inválido: usa un objeto con materia, contenido y preguntasItems, o un arreglo [ {...}, {...} ]",
    );
  }

  return lista.map((item, bloqueIdx) => {
    const n = bloqueIdx + 1;
    if (!item || typeof item !== "object") {
      throw new Error(`Bloque ${n}: debe ser un objeto JSON`);
    }
    const o = item as Record<string, unknown>;
    const materia = typeof o.materia === "string" ? o.materia : "";
    const contenido = typeof o.contenido === "string" ? o.contenido : "";
    const titulo = typeof o.titulo === "string" ? o.titulo : undefined;

    if (!normalizarMateriaAdmin(materia)) {
      throw new Error(
        `Bloque ${n}: materia "${materia}" no válida. Usa una de: ${AREAS_ICFES.join(", ")}`,
      );
    }
    if (!contenido.trim()) {
      throw new Error(`Bloque ${n}: falta contenido (texto base del contexto)`);
    }
    if (!Array.isArray(o.preguntasItems) || o.preguntasItems.length === 0) {
      throw new Error(`Bloque ${n}: preguntasItems debe ser un arreglo con al menos una pregunta`);
    }

    const preguntasItems = o.preguntasItems.map((p, i) => {
      if (!p || typeof p !== "object") {
        throw new Error(`Bloque ${n}, pregunta ${i + 1}: formato inválido`);
      }
      const q = p as Record<string, unknown>;
      return {
        enunciado: String(q.enunciado ?? ""),
        opcionA: String(q.opcionA ?? ""),
        opcionB: String(q.opcionB ?? ""),
        opcionC: String(q.opcionC ?? ""),
        opcionD: String(q.opcionD ?? ""),
        correcta: String(q.correcta ?? ""),
        explicacion: String(q.explicacion ?? ""),
        dificultad:
          typeof q.dificultad === "string" ? q.dificultad : undefined,
        orden: typeof q.orden === "number" ? q.orden : undefined,
      } satisfies PreguntaImportInput;
    });

    for (let i = 0; i < preguntasItems.length; i++) {
      const err = validarPreguntaInput(preguntasItems[i]);
      if (err) throw new Error(`Bloque ${n}, pregunta ${i + 1}: ${err}`);
    }

    return { materia, titulo, contenido, preguntasItems };
  });
}

export function validarPreguntaInput(p: PreguntaImportInput): string | null {
  if (!p.enunciado?.trim()) return "Falta enunciado";
  if (!p.opcionA?.trim() || !p.opcionB?.trim() || !p.opcionC?.trim() || !p.opcionD?.trim()) {
    return "Las cuatro opciones son obligatorias";
  }
  const c = p.correcta?.trim().toUpperCase();
  if (!c || !["A", "B", "C", "D"].includes(c)) return "Correcta debe ser A, B, C o D";
  if (!p.explicacion?.trim()) return "Falta explicación";
  return null;
}

export const LIMITES_CONTENIDO = {
  /** Ideal para enunciado en móvil (swipe). */
  enunciadoRecomendado: 280,
  enunciadoMax: 800,
  /** Opciones: se muestran con line-clamp-2. */
  opcionRecomendada: 120,
  opcionMax: 400,
  /** Contexto: scrollable; Lectura Crítica puede ser más largo. */
  contextoRecomendado: 2500,
  contextoMax: 8000,
} as const;
