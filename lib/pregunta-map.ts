import type { ContextoDTO, PreguntaConContexto } from "@/lib/admin/preguntas";

type PreguntaDb = {
  id: string;
  materia: string;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  ordenEnContexto: number | null;
  contexto: { id: string; titulo: string | null; contenido: string } | null;
};

export function mapPreguntaPublica(p: PreguntaDb): PreguntaConContexto {
  const contexto: ContextoDTO | null = p.contexto
    ? { id: p.contexto.id, titulo: p.contexto.titulo, contenido: p.contexto.contenido }
    : null;

  return {
    id: p.id,
    materia: p.materia,
    enunciado: p.enunciado,
    opcionA: p.opcionA,
    opcionB: p.opcionB,
    opcionC: p.opcionC,
    opcionD: p.opcionD,
    contexto,
    ordenEnContexto: p.ordenEnContexto,
  };
}

export const preguntaConContextoSelect = {
  id: true,
  materia: true,
  enunciado: true,
  opcionA: true,
  opcionB: true,
  opcionC: true,
  opcionD: true,
  ordenEnContexto: true,
  contexto: {
    select: { id: true, titulo: true, contenido: true },
  },
} as const;
