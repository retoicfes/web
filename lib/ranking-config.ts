/** Máximo de filas mostradas por pestaña de ranking (mejores puntajes primero). */
export const RANKING_TOP_POR_SCOPE = {
  colegio: 50,
  municipio: 50,
  departamento: 50,
  nacional: 50,
} as const;

export type RankingScope = keyof typeof RANKING_TOP_POR_SCOPE;

export function limiteRanking(scope: string): number {
  if (scope in RANKING_TOP_POR_SCOPE) {
    return RANKING_TOP_POR_SCOPE[scope as RankingScope];
  }
  return 50;
}

export const DESCRIPCION_RANKING: Record<RankingScope, string> = {
  colegio: "Top 50 mejores puntajes en tu colegio (solo el mejor intento por estudiante).",
  municipio: "Top 50 en el municipio (un puntaje por estudiante).",
  departamento: "Top 50 en el departamento (un puntaje por estudiante).",
  nacional: "Top 50 colegios (promedio del mejor puntaje de cada estudiante).",
};
