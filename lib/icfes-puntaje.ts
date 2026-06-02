/** Áreas Saber 11 y fórmula de puntaje global (ponderación oficial simplificada). */
export const AREAS_ICFES = [
  "Lectura Crítica",
  "Matemáticas",
  "Sociales y Ciudadanas",
  "Ciencias Naturales",
  "Inglés",
] as const;

export type AreaICFES = (typeof AREAS_ICFES)[number];

/** Peso por prueba: LC, Mat, Soc, CN ×3; Inglés ×1 (suma 13). */
export const PONDERACION_AREA: Record<AreaICFES, number> = {
  "Lectura Crítica": 3,
  Matemáticas: 3,
  "Sociales y Ciudadanas": 3,
  "Ciencias Naturales": 3,
  Inglés: 1,
};

export const SUMA_PONDERACIONES = 13;

export type StatsArea = { correctas: number; total: number };

export type DetalleAreaICFES = StatsArea & {
  puntaje: number;
  ponderacion: number;
  ponderado: number;
};

export type ResultadoICFES = {
  puntajeGlobal: number;
  porArea: Record<AreaICFES, DetalleAreaICFES>;
};

export function normalizarMateria(materia: string): AreaICFES | null {
  const t = materia.trim().toLowerCase();
  return AREAS_ICFES.find((a) => a.toLowerCase() === t) ?? null;
}

export function statsVacias(): Record<AreaICFES, StatsArea> {
  return Object.fromEntries(
    AREAS_ICFES.map((a) => [a, { correctas: 0, total: 0 }]),
  ) as Record<AreaICFES, StatsArea>;
}

/** Puntaje de prueba 0–100 según aciertos en la ronda. */
export function puntajePrueba0a100(stats: StatsArea): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.correctas / stats.total) * 100);
}

/** Paso 1: puntaje × ponderación por área. */
export function puntajePonderado(puntajeArea: number, area: AreaICFES): number {
  return puntajeArea * PONDERACION_AREA[area];
}

/**
 * Paso 2: (suma ponderados / 13) × 5, redondeado → puntaje global 0–500.
 */
export function calcularPuntajeGlobal(puntajesArea: Record<AreaICFES, number>): number {
  let sumaPonderada = 0;
  for (const area of AREAS_ICFES) {
    sumaPonderada += puntajesArea[area] * PONDERACION_AREA[area];
  }
  return Math.round((sumaPonderada / SUMA_PONDERACIONES) * 5);
}

export function calcularResultadoICFES(
  respuestas: { materia: string; correcta: boolean }[],
): ResultadoICFES {
  const stats = statsVacias();

  for (const r of respuestas) {
    const area = normalizarMateria(r.materia);
    if (!area) continue;
    stats[area].total += 1;
    if (r.correcta) stats[area].correctas += 1;
  }

  const porArea = {} as Record<AreaICFES, DetalleAreaICFES>;
  const puntajes: Record<AreaICFES, number> = {} as Record<AreaICFES, number>;

  for (const area of AREAS_ICFES) {
    const puntaje = puntajePrueba0a100(stats[area]);
    puntajes[area] = puntaje;
    porArea[area] = {
      ...stats[area],
      puntaje,
      ponderacion: PONDERACION_AREA[area],
      ponderado: puntajePonderado(puntaje, area),
    };
  }

  return {
    puntajeGlobal: calcularPuntajeGlobal(puntajes),
    porArea,
  };
}

/** Etiqueta corta para chips móviles. */
export const ETIQUETA_CORTA_AREA: Record<AreaICFES, string> = {
  "Lectura Crítica": "Lectura",
  Matemáticas: "Matemáticas",
  "Sociales y Ciudadanas": "Sociales",
  "Ciencias Naturales": "Ciencias",
  Inglés: "Inglés",
};
