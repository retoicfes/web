import { PREGUNTAS_POR_AREA_RONDA, shuffleArraySeeded } from "@/lib/game";
import { AREAS_ICFES } from "@/lib/icfes-puntaje";
import { randomBytes } from "node:crypto";

type PreguntaSelectable = { id: string; materia: string };

function shuffleConSemilla<T>(items: T[], seed: string): T[] {
  return shuffleArraySeeded(items, seed);
}

/** Elige hasta `n` ítems del área, priorizando ids que no estén en `excluir`. */
function elegirDelArea<T extends PreguntaSelectable>(
  delArea: T[],
  n: number,
  excluir: Set<string>,
  seed: string,
): T[] {
  if (delArea.length <= n) return shuffleConSemilla(delArea, seed);

  const preferidas = delArea.filter((p) => !excluir.has(p.id));
  const restantes = delArea.filter((p) => excluir.has(p.id));

  const mezcladas = [
    ...shuffleConSemilla(preferidas, `${seed}:pref`),
    ...shuffleConSemilla(restantes, `${seed}:rest`),
  ];

  return mezcladas.slice(0, n);
}

/**
 * 2 preguntas aleatorias por área (10 total), mezcladas al final.
 * Cada llamada usa semilla criptográfica nueva → ronda distinta.
 */
export function seleccionarPreguntasRonda<T extends PreguntaSelectable>(
  todas: T[],
  limit: number,
  excluirIds: string[] = [],
): T[] {
  const excluir = new Set(excluirIds);
  const seed = randomBytes(16).toString("hex");
  const porArea = AREAS_ICFES.length * PREGUNTAS_POR_AREA_RONDA;

  if (limit >= porArea) {
    const seleccion: T[] = [];
    for (const area of AREAS_ICFES) {
      const delArea = todas.filter((p) => p.materia === area);
      seleccion.push(
        ...elegirDelArea(delArea, PREGUNTAS_POR_AREA_RONDA, excluir, `${seed}:${area}`),
      );
    }
    return shuffleConSemilla(seleccion, `${seed}:final`).slice(0, limit);
  }

  return shuffleConSemilla(todas, seed).slice(0, limit);
}
